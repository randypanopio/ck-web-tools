from cgitb import lookup
from msilib.schema import tables
import numpy as np
from PIL import Image
from colorspacious import cspace_convert
from numpy.linalg import norm as distance
import os
import copy 

image_name = 'gem.jpg'
input_image = Image.open('{}\{}\{}'.format(os.getcwd(), 'scratch\imageIO\input', image_name))

# NOTE this has been me trying to figure out translating between colorspaces to get a more "accurate" color over the typical euclidean nearest neighbor calculation

dim_scale = 128
# pixelated_img = input_image.resize((int(dim_scale/input_image.height * input_image.width), dim_scale),resample=Image.Resampling.BILINEAR)

pixel_array = np.array(input_image)

print ('----------------------------')
print ('orginal input SRGB array')
print (pixel_array)
print ('============================')

# output_image.save('{}\{}\{}'.format(os.getcwd(), 'imageIO\output', (image_name[:-3]) + "png"))

#TODO interpret each pixel, map it to an available color
#region color dicts

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


wscolors = ((0,0,0),
(0,0,51),
(0,0,102),
(0,0,153),
(0,0,204),
(0,0,255),
(0,51,0),
(0,51,51),
(0,51,102),
(0,51,153),
(0,51,204),
(0,51,255),
(0,102,0),
(0,102,51),
(0,102,102),
(0,102,153),
(0,102,204),
(0,102,255),
(0,153,0),
(0,153,51),
(0,153,102),
(0,153,153),
(0,153,204),
(0,153,255),
(0,204,0),
(0,204,51),
(0,204,102),
(0,204,153),
(0,204,204),
(0,204,255),
(0,255,0),
(0,255,51),
(0,255,102),
(0,255,153),
(0,255,204),
(0,255,255),
(51,0,0),
(51,0,51),
(51,0,102),
(51,0,153),
(51,0,204),
(51,0,255),
(51,51,0),
(51,51,51),
(51,51,102),
(51,51,153),
(51,51,204),
(51,51,255),
(51,102,0),
(51,102,51),
(51,102,102),
(51,102,153),
(51,102,204),
(51,102,255),
(51,153,0),
(51,153,51),
(51,153,102),
(51,153,153),
(51,153,204),
(51,153,255),
(51,204,0),
(51,204,51),
(51,204,102),
(51,204,153),
(51,204,204),
(51,204,255),
(51,255,0),
(51,255,51),
(51,255,102),
(51,255,153),
(51,255,204),
(51,255,255),
(102,0,0),
(102,0,51),
(102,0,102),
(102,0,153),
(102,0,204),
(102,0,255),
(102,51,0),
(102,51,51),
(102,51,102),
(102,51,153),
(102,51,204),
(102,51,255),
(102,102,0),
(102,102,51),
(102,102,102),
(102,102,153),
(102,102,204),
(102,102,255),
(102,153,0),
(102,153,51),
(102,153,102),
(102,153,153),
(102,153,204),
(102,153,255),
(102,204,0),
(102,204,51),
(102,204,102),
(102,204,153),
(102,204,204),
(102,204,255),
(102,255,0),
(102,255,51),
(102,255,102),
(102,255,153),
(102,255,204),
(102,255,255),
(153,0,0),
(153,0,51),
(153,0,102),
(153,0,153),
(153,0,204),
(153,0,255),
(153,51,0),
(153,51,51),
(153,51,102),
(153,51,153),
(153,51,204),
(153,51,255),
(153,102,0),
(153,102,51),
(153,102,102),
(153,102,153),
(153,102,204),
(153,102,255),
(153,153,0),
(153,153,51),
(153,153,102),
(153,153,153),
(153,153,204),
(153,153,255),
(153,204,0),
(153,204,51),
(153,204,102),
(153,204,153),
(153,204,204),
(153,204,255),
(153,255,0),
(153,255,51),
(153,255,102),
(153,255,153),
(153,255,204),
(153,255,255),
(204,0,0),
(204,0,51),
(204,0,102),
(204,0,153),
(204,0,204),
(204,0,255),
(204,51,0),
(204,51,51),
(204,51,102),
(204,51,153),
(204,51,204),
(204,51,255),
(204,102,0),
(204,102,51),
(204,102,102),
(204,102,153),
(204,102,204),
(204,102,255),
(204,153,0),
(204,153,51),
(204,153,102),
(204,153,153),
(204,153,204),
(204,153,255),
(204,204,0),
(204,204,51),
(204,204,102),
(204,204,153),
(204,204,204),
(204,204,255),
(204,255,0),
(204,255,51),
(204,255,102),
(204,255,153),
(204,255,204),
(204,255,255),
(255,0,0),
(255,0,51),
(255,0,102),
(255,0,153),
(255,0,204),
(255,0,255),
(255,51,0),
(255,51,51),
(255,51,102),
(255,51,153),
(255,51,204),
(255,51,255),
(255,102,0),
(255,102,51),
(255,102,102),
(255,102,153),
(255,102,204),
(255,102,255),
(255,153,0),
(255,153,51),
(255,153,102),
(255,153,153),
(255,153,204),
(255,153,255),
(255,204,0),
(255,204,51),
(255,204,102),
(255,204,153),
(255,204,204),
(255,204,255),
(255,255,0),
(255,255,51),
(255,255,102),
(255,255,153),
(255,255,204),
(255,255,255))
#endregion 
available_colors = list(color_dict.values()) 
cam_space_table = cspace_convert(available_colors, "sRGB255", "CAM02-UCS")

camws = cspace_convert(wscolors, "sRGB255", "CAM02-UCS")

def cam_nearest_color (input_color, lookup_table):
    val = lookup_table[0]
    prevdist = -1000
    for color in lookup_table:
        dist = distance(input_color - color)
        #print("DIST " + str(dist))
        # val = val if prevdist < dist else color 
        if prevdist < dist:
            val = color
        prevdist = dist
    return val


def closest(table, input):
    table = np.array(table)
    input = np.array(input)
    distances = np.sqrt(np.sum((table-input)**2,axis=1))
    index_of_smallest = np.where(distances==np.amin(distances))
    smallest_distance = table[index_of_smallest]
    return smallest_distance 


#convert srgb to cam space
cspace_convert(pixel_array, "sRGB255" ,"CAM02-UCS")
print ('----------------------------')
print ('CAM02-UCS array converted from srgb input used to calc dist')
print (pixel_array)
print ('============================')

# can probably use a static number for this since its always a rect
for x in range(len(pixel_array)):
   for y in range(len(pixel_array[x])):
       pixel_array[x,y] = closest(camws, pixel_array[x,y])
    #    pixel_array[x,y] = cam_nearest_color(pixel_array[x,y], cam_space_table)

print ('----------------------------')
print ('Mapped from CAM02-UCS using euclidan dist')
print (pixel_array)
print ('============================')

#reconvert back to rgb
cspace_convert(pixel_array, "CAM02-UCS" ,"sRGB255")
print ('----------------------------')
print ('Reconverted RGB value from CAM02-UCS value')
print (pixel_array)
print ('============================')


output_image = Image.fromarray(pixel_array)
output_image.save('{}\{}\{}'.format(os.getcwd(), 'scratch\imageIO\output', "output2.png"))

