# Trubis
##Simple game Trubis

This is a version of old game 'Trubis'.
It has been written almost on JS. 
I've used JQuery lib, JQuery rotate plugin (for rotate image block), JQueryUI (for unique id).
The main goal of the game is to destroy chain of blocks components, constituting a pipeline. Like in the Tetris.
We can destriy a chains by bomb of if we constructed 'closed' pipeline (without open end of pipe).
New pipe block randomly generating at the top of game screen and fall discret down on the game stage bottom.
When heap of nondeleted tube-blocks had reached the top of game stage, the game is overed. 


##Data structure
There are 3 layer of data structure in my project.
  1. It's simple html img tag, dynamicaly generated for next random tube-block with unique id (thx jqueryui).
  2. Previously generated image implies some informations about relations between this block and outer world. 
All informations contains in object 'Elem' (like number of sockets, image id, rotate function, open sockets). 
Additionaly, there is another structure - the array 'ex', which pointing to the 'Elem', and associating it's position on game stage.
  3. Third structural construction is a 'list of list'. It contains lists of tube-block wich connected in one pipeline.

#Future power ups
This project have 'not realy good design'. It's greatly possibility to work in this direction.
Due to the fact that I written 'game' like a test job, there is a huge possibility of the existence of 'non optimized code'.

#Authority
You can use any parts of code without link to me.
Thanks for watching. )
