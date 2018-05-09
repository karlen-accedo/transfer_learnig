# transfer_learnig

The project allows to build a image classifier in short time, by using transfer learning, from Googles Inception_v3 model.
It uses **_tensorflow 1.7.0, pyhton 3.5.0, node JS 8.9_** and requires 64 bit architecture os.

To train on your own data sent should be done the following.

1. Create folder named **_samples_** in project directory, in must contain all training data in it.
2. The training data must be classified by folders, i.e each folder represent exactly one class, the name of files are not restricted.
3. To start training open any command line terminal and run `npm start`, it may take up to 1 hour depending on your system and configuration parameters that you provided(parameters will be provided below)
4. After training is finished you can now use the model by calling `IMAGE=[image_filepath] node label.js` and the results will be printed in your console.
5. You can also see the training process by typing `image=[image_file_path] node label.js`

The initial configuration is as follows and it can be controlled by environment variables or by editing the **_server.js_** file.
```
	'image_dir': env.image_dir || './tmp/data/',
	'how_many_training_steps':env.how_many_training_steps || 500,
	'testing_percentage': env.testing_percentage ||10,
	'validation_percentage': env.validation_percentage ||10,
	'train_batch_size': env.train_batch_size ||100,
	'final_tensor_name': env.final_tensor_name ||'final_result',
	'trainer_file_path':'train.py'
```
