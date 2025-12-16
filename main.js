//
// Assignment 3
const fs = require('fs')
const path = require('path')
const http = require('http');
let port = 3000
// Part1: Core Modules ( 1.5 Grades)
// 1. Use a readable stream to read a file in chunks and log each chunk. (0.5 Grade)
// • Input Example: "./big.txt"
// • Output Example: log each chunk

const filePath = path.resolve('./big.txt')

const readStream= fs.createReadStream(filePath , {encoding: 'utf-8'})

readStream.on('data' , (chunk)=>{
    console.log({logEachChunk :chunk});
    

})

readStream.on('end', () => {
    console.log('Finished reading file.');
});

readStream.on('error', (err) => {
    console.log('Error:', err.message);
});
// 2. Use readable and writable streams to copy content from one file to another. (0.5 Grade)
// • Input Example: "./source.txt", "./dest.txt"
// • Output Example: File copied using streams

const sourceFilePath = path.resolve('./source.txt')
const destFilePath = path.resolve('./dest.txt')

const readStreamSource = fs.createReadStream(sourceFilePath , {encoding : 'utf-8'})
const writeStreamDest = fs.createWriteStream(destFilePath)
readStreamSource.on('data' , (chunk)=>{
    console.log({chunk});

    writeStreamDest.write(chunk)
    
})
readStreamSource.on('end', () => {
    console.log("File copied using streams.");
});

// 3. Create a pipeline that reads a file, compresses it, and writes it to another file. (0.5 Grade)
// • Input Example: "./data.txt", "./data.txt.gz"

const dataFilePath = path.resolve('./data.txt')
const destFileZipPath = path.resolve('./data.txt.gz')

const readStreamDataFile = fs.createReadStream(dataFilePath)
const writeStreamZipDestFile = fs.createWriteStream(destFileZipPath)

const {createGzip} = require('node:zlib')
const zip = createGzip()
// read --> gzip --> write
readStreamDataFile.pipe(zip).pipe(writeStreamZipDestFile)


////////////////////////////////////////////////////////////////////////////////////////////////

// Part2: Simple CRUD Operations Using HTTP ( 5.5 Grades):
// For all the following APIs, you must use the fs module to read and write data from a JSON file (e.g., users.json).
// Do not store or manage data using arrays (0.5 Grades).

// Using HTTP 
// use the fs module to read and write data from a JSON file
//Do not store or manage data using arrays 

const usersFilePath = path.resolve("./users.json");


function getUsers(){
    return JSON.parse(fs.readFileSync(usersFilePath , {encoding : 'utf-8'}))

}
function saveUsers(data){
    fs.writeFileSync(usersFilePath , JSON.stringify(data))
}

const server = http.createServer((req , res)=>{
    const {method , url}=req  
    console.log({method , url});

    // 1. Create an API that adds a new user to your users stored in a JSON file.
        //  (ensure that the email of the new user doesn’t exist before) (1 Grade)
        // o URL: POST /addUser
        if(method === 'POST' && url ==='/addUser'){
            let body =''
            req.on('data' , (chunk)=>{
                body+=chunk
            })
            req.on('end' , ()=>{
                try{
                    const {userName , email , age  } = JSON.parse(body) // str ----> obj
                    if(!email){
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: "Email required" }));
                    }
                    const users = getUsers() // read file 

                // check email 
                const emailExist = users.find( (user)=>{
                    return user.email === email
                })
                if(emailExist){  // هل ال email ال ف postman هو هو نفس ال email ال ف ال file 
                    res.writeHead(409, {'content-type' :'application/json'})
                    return res.end(JSON.stringify({message : 'Email is  already exist '}))
                }
                // push new user 
                const newUser ={
                    id:Date.now().toString() ,
                    userName ,
                    email ,
                    age
                }
                users.push(newUser);
                // 5- Save in file 
                saveUsers(users);

                res.writeHead(201, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "User created", newUser: newUser }));
            
                }catch(e){
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ message: "Invalid JSON" }));
                }
            } )


        }
        //2. Create an API that updates an existing user's name, age, or email by their ID. 
        // The user ID should be retrieved from the URL (1 Grade)
        // Note: Remember to update the corresponding values in the JSON file
        // URL: PATCH /updateUser/id
        
        
        else if(method === 'PATCH' && url.startsWith('/updateUser/')){
             // extract id ....
            // get data to be updated
            // read file data  
            // find if the desired user found ? not ==> return res not found 
            // if email ? check if email is already exist & owned different user 
            // otherwise ==> update 
            // write file 
            // return res successfully 

            const id = req.url.split('/')[2]
            let body = ''
            req.on('data' , (chunk)=>{
                body+=chunk
            })
            req.on('end' , ()=>{
                try{
                    const {userName , age , email} = JSON.parse(body)

                    const users = getUsers()

                    const userIndex = users.findIndex( (user)=> user.id = id )
                    if(userIndex === -1){
                        res.writeHead(404, {'content-type' :'application/json'})
                        return res.end(JSON.stringify({message : 'User Not Found .'}))
                    }
                    // check if email is already exist & owned different user 
                    if(email && users.some((user , index)=>user.email === email && index != userIndex)){
                        res.writeHead(409, {'content-type' :'application/json'})
                        return res.end(JSON.stringify({message : 'Email is already exist .'}))
                    }
                    if(userName) users[userIndex].userName = userName
                    if(email) users[userIndex].email = email
                    if(age) users[userIndex].age = age

                    saveUsers(users)
                    res.writeHead(200, {'content-type' :'application/json'})
                    return res.end(JSON.stringify({message : 'User  Updated Successfully  .'}))
                }catch(error){
                        res.writeHead(400, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ message: "Invalid JSON" }));
                }


            })
        }

        // 3. Create an API that deletes a User by ID. The user id should be retrieved from the URL (1 Grade)
        // Note: Remember to delete the user from the file
        // o
        // URL: DELETE /deleteUser/id
        else if(method === "DELETE" , url.startsWith('/deleteUser')){

            // extract id 
            // read file 
            // userIndex check found ? res 
            // splice 
            // save 
            // return res .
            try {
                // extract id 
                const id = req.url.split('/')[2]

                // read file 
                const users = getUsers()

                 // userIndex check found ? res 
                const userIndex = users.findIndex((user)=> user.id === id ) 
                
                if(userIndex === -1){
                    res.writeHead(404, {'content-type' :'application/json'})
                    return res.end(JSON.stringify({message : 'User Not Found .'}))
                }
                
                // splice 
                users.splice(userIndex , 1 )  // delete 

                // save
                saveUsers(users)

                res.writeHead(200, {'content-type' :'application/json'})
                return res.end(JSON.stringify({message : 'User delete Successfully  .'}))
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Invalid JSON" }));
            }
        }
        
        // 4. Create an API that gets all users from the JSON file. (1 Grade)
        // URL: GET /allUser
        else if (method === "GET" , url=== '/allUsers'){
            // read 
            const users = getUsers()
            res.writeHead(200 , {'content-type' : 'application/json'})
            res.end(JSON.stringify({message : 'Users Found' , users }))
        }
        // 5.
        // Create an API that gets User by ID. (1 Grade)
        // o
        // URL: GET /getUser/:id
        // o
        // Output:
        //get user by id 
        else if(req.method === 'GET'  && req.url.startsWith('/getUser/')){
            try {
                    // id extract 
                    const id = req.url.split('/')[2]

                    // read file 
                    const users = getUsers()
                    //  // check user index by id 
                    const user = users.find((user)=> user.id === id )

                    if(!user){
                        res.writeHead(404, {'content-type' :'application/json'})
                        return res.end(JSON.stringify({message : 'User Not Found .'}))
                    }

                    res.writeHead(200, {'content-type' :'application/json'})
                    return res.end(JSON.stringify({message : 'User Found .' , user }))
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Invalid JSON" }));
            }

        }
        else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({message : "Invalid Routing ."}));
    }
    
    })


function listen(port){
    return server.listen(port , '127.0.0.1' , ()=>{
        console.log(`Server is Running on port :::${port} 🚀🚀🚀🚀`);
        
    })
}
listen(port)

//////////////////////////////
// Part3: Node Internals (3 Grades):
// 1.
// What is the Node.js Event Loop? (0.5 Grade)

// is a fundamental concept that allows Node.js to perform non-blocking,
//  asynchronous operations despite being single-threaded.

// 2.
// What is Libuv and What Role Does It Play in Node.js? (0.5 Grade)
// libuv is a C library used by Node.js.

// It allows Node.js to perform non-blocking operations (like file system access, networking, timers) 
// on multiple threads behind the scenes even though JavaScript runs in a single thread.


// 3.
// How Does Node.js Handle Asynchronous Operations Under the Hood? (0.5 Grade)

//  Node.js is Single-Threaded for JS

// JavaScript in Node.js runs on a single main thread (the call stack).

// If an operation blocks this thread, nothing else can run.

// 4.
// What is the Difference Between the Call Stack, Event Queue, and Event Loop in Node.js? (0.5 Grade)

// 	Call Stack

// Where currently executing functions live in Node.js.

// Uses LIFO (Last In First Out).

// Only synchronous code runs here.


// 	 Event Queue / Callback Queue

// Stores asynchronous callbacks until the Call Stack is empty.
// Async tasks include:
// setTimeout ,fs.readFile , Network requests , Uses FIFO (First In First Out).


// 	Event Loop
// Manager between Call Stack and Event Queue.

// Continuously checks:
// Is the Call Stack empty?
// If yes → takes the first callback from Event Queue → executes it on the Call Stack.



// 5.
// What is the Node.js Thread Pool and How to Set the Thread Pool Size? (0.5 Grade)


// Node.js JavaScript code runs on a single thread 

// But many tasks, like file system operations, DNS lookups, or crypto operations, are blocking or CPU-intensive.

// To handle them asynchronously, Node.js uses a thread pool behind the scenes (provided by libuv).

// Setting the Thread Pool Size

// $env:UV_THREADPOOL_SIZE=1; node index.js


// 6.
// How Does Node.js Handle Blocking and Non-Blocking Code Execution? (0.5 Grade)

// Blocking Code (Synchronous)

// Executes line by line.
// Blocks the main thread until the operation finishes.

// Non-Blocking Code (Asynchronous)

// Executes without stopping the main thread.

// JS continues executing while the async task runs in libuv thread pool or using OS async APIs.




// important Notes about postman
// 1.
// Name the endpoint with a meaningful name like 'Add User', not dummy names.
// HTTP Method: POST

// Endpoint: /user or /users

// Meaningful Name: Add User


// 2.
// Save your changes on each request( ctrl+s ).
// very time you make changes in your Node.js files (like server.js), you must save the file (Ctrl+S)
//  before sending a new request in Postman or any API testing tool.

// // 3.
// Include the Postman collection link
// When you finish building your APIs, you must:

// Export your Postman collection (the saved API requests)

// Upload it somewhere (e.g., Google Drive, GitHub, Dropbox)

// And then include the link to that collection in your assignment / project / submission.


//////////////////////////////////////////////////////////////////////////////



