Fun web app and tools for Core Keeper

How to use:
Download the latest version of python (3.9)
Install pip 

download extract this project folder (or whatever means you want to pull down) to where you want to save the app
on your cli run the following commands:



WARNING This process is so convoluted it's not worth it, I would recommend you use an external transpiler and point to the styles folder instead.
- for styling stuff, if you want an automated sass task for vscode you need to install the following: (outside of win10 and vscode, you may want to figure out on your own how to install npm, the needed npm packages, and your gulp runner)
For this project, all sass/styles files will be in the web/styles/sass folders, and their transpiled equivalent we will save on the web/styles/css folders. Each page should load only their necessary .css files

Look here for the official documentation for automating sass for vscode: https://code.visualstudio.com/docs/languages/css
- install nodejs - https://nodejs.org/en/ make sure when installing, you also install npm (otherwise npm and your environment variables wont be set up)
- run the following commands on a terminal (vscode powershell should work, make sure you aren't working in the virtual environment): 
    npm install -g gulp
        - note: this installs npm globally
        - if you see any warnings about vulnerability, go ahead and follow and run the following command: npm audit fix --force
    npm install gulp gulp-sass
        - this project uses sass, if you'd like to integrate less styles, please let me know
