from cgitb import lookup
from msilib.schema import tables
import numpy as np
from PIL import Image
from colorspacious import cspace_convert
from numpy.linalg import norm as distance
import os

image_name = 'gem.jpg'
input_image = Image.open('{}\{}\{}'.format(os.getcwd(), 'scratch\imageIO\input', image_name))


dim_scale = 128
# pixelated_img = input_image.resize((int(dim_scale/input_image.height * input_image.width), dim_scale),resample=Image.Resampling.BILINEAR)

input_as_array = np.array(input_image)


# output_image.save('{}\{}\{}'.format(os.getcwd(), 'imageIO\output', (image_name[:-3]) + "png"))

#TODO interpret each pixel, map it to an available color


color_dict = {
   'dirt ground' : (127, 95, 50),
   'turf ground' : (86, 128, 99),
   'sand ground' : (212, 185, 90),
   'clay ground' : (232, 139, 105),
   'stone ground' : (104, 131, 151),
   'larva ground' : (199, 117, 99),
   'grass ground' : (61, 155, 64),
   'mold ground' : (108, 188, 224),
   'wood bridge' : (140, 88, 38),
   'wood floor' : (199, 148, 79),
   'paintable floor (unpainted)' : (159, 180, 236),
   'stone bridge' : (124, 117, 108),
   'stone floor' : (129, 132, 140),
   'scarlet bridge' : (168, 28, 46),
   'scarlet floor' : (178, 53, 38),
   'caveling floor tile' : (130, 130, 130),
   'dark caveling floor tile' : (130, 130, 130),
   'woven mat' : (59, 139, 64),
   'blue paint' : (42, 108, 228),
   'green paint' : (85, 182, 38),
   'yellow paint' : (255, 232, 46),
   'white paint' : (129, 173, 224),
   'purple paint' : (139, 79, 167),
   'red paint' : (223, 0, 0),
   'brown paint' : (151, 75, 38),
   'black paint' : (75, 85, 85),
}

available_colors = list(color_dict.values()) 

#slow and gross
cam_space_table = []
for c in available_colors:
   cam_space_table.append(cspace_convert(c, "sRGB255", "CAM02-UCS"))

print (cam_space_table)

output_array = input_as_array
#naive euclidean
#simple Euclidian approach of closest color distance
def nearest_colour( subjects, query ):
    return min( subjects, key = lambda subject: sum( (s - q) ** 2 for s, q in zip( subject, query ) ) )

def cam_nearest_color_rgb (input_color, lookup_table):
    val = lookup_table[0]
    prevdist = 1000
    for color in lookup_table:
        dist = distance(input_color - color)
        #print("DIST " + str(dist))
        val = val if prevdist < dist else color 
        prevdist = dist
    return cspace_convert(val, "CAM02-UCS", "sRGB255")


def closest(table, input):
    table = np.array(table)
    input = np.array(input)
    distances = np.sqrt(np.sum((table-input)**2,axis=1))
    index_of_smallest = np.where(distances==np.amin(distances))
    smallest_distance = table[index_of_smallest]
    return smallest_distance 


# can probably use a static number for this since its always a rect
for x in range(len(input_as_array)):
   for y in range(len(input_as_array[x])):
      #print("Px-{},{}: {}".format(x,y,input_as_array[x,y]))
      # output_array[x,y] = nearest_colour(available_colors, input_as_array[x,y]) 
       output_array[x,y] = cam_nearest_color_rgb( cspace_convert(input_as_array[x,y], "sRGB255", "CAM02-UCS"), cam_space_table)
      #break
print ('----------------------------')
print ('CAM02-UCS COLORSPACE EUCLIDEAN CLOSEST MAPPING')
# print (output_array)
print ('----------------------------')
output_image = Image.fromarray(output_array)
output_image.save('{}\{}\{}'.format(os.getcwd(), 'scratch\imageIO\output', "cam02output.png"))