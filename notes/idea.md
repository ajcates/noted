I want to build a note editor using node.js

the note editor will be built using a koa.js backend and a vue.js front end.

It will be a web server launched from the command line.

The app will be a progressive web application that will work offline and when it connects back to the server will sync the changes that have been made in both direction.

So what ever the path is set to it will open up a mobile optimized web page showing a listing of the files and folders in that directory. You can then click on a text file and  the app will start editing the file.

The app will use mdui web components
https://www.mdui.org/en/docs/2/

And Vue.js 3 should be used wirh Pinia for state managment.

 

`noted [path] [options]`

-p, --port [6767] Port to use defaults to 6767 and if its already in use a warning will be shown and a it will add one to the port number

-c, --config [config.env] The config file to use.

-r, --readonly Runs in read only mode

-h, --help This help.cc


If you could take this rough draft of an idea and then ask me any qiestions to better understand the project in order to write out an overview.md note file and then a spec.md note.

After those are created we are then going to make a RoadMap.md file with the different phases needed to build out the project with a short summary about each phase and its goals in the RoadMap.md filec

Then once we have the RoadMap.md file we are going to write out a rough draft todo file for each phase broken down into stages

Before we start working on the todo items in the first phase we are going to review the file and ask any questions needed to make the todo list comperhensive and include all the step by step things in detail and maybe even broken down into subtaksks that need to be done for thst phase

oncee habe a comperhensive todo list we will start working on the items on the list and when completing a stage  we will appenend a brief note about what was done to a done.md note and commit our code to git

After we need to make sure we accomplish everything in the todo file before moving on to the next phase.
