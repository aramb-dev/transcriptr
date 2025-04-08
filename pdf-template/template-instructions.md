Creating template with plain HTML
A print template can be has simple has a simple HTML file.

1. Let's start by creating a new html file named index.html
   In this example we will be building a simple diploma in html and css that will be later print to a pdf.

<html>
  <body>
    <div class="diploma">
      <div class="diploma-header">
        <span class="course-name">Course: <span id="courseName"/></span>
      </div>
      <div class="diploma-body">
        <h1>Certificate of Completion</h1>
        <h2>Congratulation <span id="name"/></h2>
      </div>
    </div>
  </body>
</html>

2. Now let's implement the template-sdk
   Let's add a simple script tag to our html file to load the template-sdk and setup the render function

<script type="module">
    import { setup, onRender } from "https://cdn.skypack.dev/@printerz-app/template-sdk"
    setup();

    const { register } = onRender((variables) => {
        console.log(variables);

        document.getElementById("courseName").innerHTML = variables.courseName;
        document.getElementById("name").innerHTML = variables.name;
    });

    register();

</script>

So in order to setup the template sdk we need to :

Call the setup function, this function need to be called only once and ideal has soon as possible in the html file.

Call the onRender function, this will allow you to execute code before the template is rendered, this function can also be async.

Call the register function, this function will allow you to register the callback function defined in onRender that will be called each time the template is rendered.

If you want to test the behavior of your on render function you can open your browser console and type the following

window.printerzRender({courseName: "printerz expert", name: "John doe" /_ ...yor variables _/})

3. Now let's spice up the template with some css and add our logo
   Let's great or css file and add our logo

Here some simple css to make the diploma look (nice)

@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

body,
html {
font-family: "Roboto", sans-serif;
width: 100%;
height: 100%;
margin: 0;
}

body {
display: flex;
}

.diploma {
padding: 20px;
height: 100%;
width: 100%;
display: flex;
flex-direction: column;
}

.diploma-header {
display: flex;
justify-content: space-between;
align-items: center;
}

.course-name {
font-size: 1.5em;
font-weight: bold;
}

.diploma-body {
height: 100%;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
}

Let's modify our html file to use the css file and add our logo

<html>
  <head>
    <link rel="stylesheet" href="./index.css">
  </head>
  <body>
    <div class="diploma">
      <div class="diploma-header">
        <img src="./logo.png" width="150px" height="100px">
        <span class="course-name">Course: <span id="courseName"/></span>
      </div>
      <div class="diploma-body">
        <h1>Certificate of Completion</h1>
        <h2>Congratulation <span id="name"/></h2>
      </div>
    </div>
  </body>
</html>

When including a local file into your html document make sure to use a relative path, since after you will upload it to printerz it will be put in a specific folder

Assuming the following file tree:

If you want to include the logo.png file you will need to use a relative path

Bad ❌
<img src="/logo.png" width="150px" height="100px">
Good ✅
<img src="./logo.png" width="150px" height="100px"> 4. Pack it then ship it 🚀
Our last step is to create a zip file that will contain our html and css files and our logo.

And now we can upload our zip file to printerz !

[![printerz](https://img.shields.io/badge/printerz-Upload%20now-blue)](https://app.printerz.app/upload)
