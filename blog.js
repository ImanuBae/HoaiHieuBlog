// Dữ liệu bài viết Blog
const blogPosts = [
        {
        id: 1,
        title: "Intro to Socket Programming in Java: Building Your First Client-Server App",
        category: "java",
        date: "12/10/2025",
        excerpt: "Ever wonder how chat apps, web browsers, or online games 'talk' to each other over the Internet? The secret lies in Sockets...",
        content: `<h3>Intro to Socket Programming in Java: Building Your First Client-Server App</h3>
    <p><strong>Author:</strong> Hieu's Story</p>
    <p><strong>Posted on:</strong> October 12, 2025</p>
    <p><strong>Category:</strong> Java Network Programming</p>

    <p>Ever wonder how chat apps, web browsers, or online games "talk" to each other over the Internet? The secret lies in one of the most fundamental concepts of network programming: Sockets. When I was a student, this concept also seemed quite abstract. But trust me, once you write your first program by hand, everything will become crystal clear.</p>

    <p>In this article, we will build a super-simple Client-Server application together so you can understand the essence of the problem.</p>

    <h4>What is a Socket? Imagine a Phone Call</h4>
    <p>The easiest way to understand Sockets is to associate it with a phone call:</p>

    <p><strong>ServerSocket (Server-side):</strong> Like a person sitting and waiting for the phone to ring. They have a phone number (Port) and are always in a listening state (listen).</p>

    <p><strong>Socket (Client-side):</strong> Like the person who wants to make a call. They need to know the recipient's phone number (IP Address and Port) to initiate the call (connect).</p>

    <p><strong>Communication Stream:</strong> When the call is connected, a two-way communication channel is formed. Both can talk and listen through this channel (InputStream and OutputStream).</p>

    <h4>Let's get to the code: Building the Server</h4>
    <p>Our server will perform a simple task: listen for a connection on port 6868, receive a message from the client, print it to the screen, and send back a greeting.</p>

    <pre><code class="language-java">// File: SimpleServer.java
    import java.io.*;
    import java.net.*;

    public class SimpleServer {
        public static void main(String[] args) {
            try (ServerSocket serverSocket = new ServerSocket(6868)) {
                System.out.println("Server is running and waiting for connection on port 6868...");

                // Accept a connection from the client
                Socket clientSocket = serverSocket.accept();
                System.out.println("Client connected!");

                // Stream to receive data from client
                InputStream input = clientSocket.getInputStream();
                BufferedReader reader = new BufferedReader(new InputStreamReader(input));

                // Stream to send data to client
                OutputStream output = clientSocket.getOutputStream();
                PrintWriter writer = new PrintWriter(output, true);

                // Read message from client and send back a greeting
                String clientMessage = reader.readLine();
                System.out.println("Received from Client: " + clientMessage);
                writer.println("Hello, I am the Server!");

            } catch (IOException ex) {
                System.out.println("Server Error: " + ex.getMessage());
            }
        }
    }</code></pre>

    <h4>Writing the Client to connect</h4>
    <p>The Client will connect to the Server at 'localhost' (your own machine) on port 6868, send a message, and wait for a response.</p>

    <pre><code class="language-java">// File: SimpleClient.java
    import java.io.*;
    import java.net.*;

    public class SimpleClient {
        public static void main(String[] args) {
            String hostname = "localhost";
            int port = 6868;

            try (Socket socket = new Socket(hostname, port)) {
                // Stream to send data to server
                OutputStream output = socket.getOutputStream();
                PrintWriter writer = new PrintWriter(output, true);
                writer.println("Hello Server, I am the Client!");

                // Stream to receive data from server
                InputStream input = socket.getInputStream();
                BufferedReader reader = new BufferedReader(new InputStreamReader(input));

                String serverResponse = reader.readLine();
                System.out.println("Received from Server: " + serverResponse);

            } catch (UnknownHostException ex) {
                System.out.println("Server not found.");
            } catch (IOException ex) {
                System.out.println("I/O Error: " + ex.getMessage());
            }
        }
    }</code></pre>

    <h4>Final Words</h4>
    <p>Congratulations! You have just completed your first network application. Although simple, it demonstrates all the core steps: listening, connecting, sending, and receiving data. In the next article, we will learn how to upgrade this Server to serve multiple Clients at the same time.</p>`,
        image: "image/img1.jpg"
    },
    {
        id: 2,
        title: "Upgrading a Java Server with Multithreading to Serve Multiple Clients",
        category: "java",
        date: "15/10/2025",
        excerpt: "In the previous post, we successfully built a simple server. But it has a fatal flaw: it can only serve one client at a time...",
        content: `<h3>Upgrading a Java Server with Multithreading to Serve Multiple Clients</h3>
    <p><strong>Author:</strong> Hieu's Story</p>
    <p><strong>Posted on:</strong> October 15, 2025</p>
    <p><strong>Category:</strong> Java Network Programming</p>

    <p>In the previous post, we successfully built a simple server. But it has a fatal flaw: at any given time, it can only serve a single Client. If a second Client tries to connect while the first Client is still connected, it will have to "get in line" and wait. This is clearly not feasible for real-world applications.</p>

    <p>So how do we solve this? The answer is <strong>Multithreading</strong>. Today, we will "transform" our Server to make it more powerful, ready to welcome multiple Clients at the same time.</p>

    <h4>Why was the old Server "weak"?</h4>
    <p>The problem lies in the line <code>serverSocket.accept()</code>. This command blocks the entire program until a client connects. After connecting, all the processing logic for that client also happens on the main thread. As long as that processing isn't finished, the Server cannot return to the loop to <code>accept()</code> a new connection.</p>

    <h4>Solution: A "Dedicated Waiter" for Each Client</h4>
    <p>The idea of multithreading is very intuitive:</p>
    <p><strong>Main Thread (Server):</strong> Acts like a manager. Its only job is to stand at the door, waiting for guests (Clients) to arrive.</p>
    <p><strong>Worker Thread (Client Handler):</strong> Every time a new guest arrives, the manager calls a separate "waiter" (Thread) to take care of that guest.</p>
    <p>This way, the manager is always free to greet new guests, and each guest is served in parallel by their own dedicated waiter.</p>

    <h4>Implementing the Multi-threaded Server</h4>
    <p>First, we need to create a <strong>ClientHandler</strong> class to handle the logic for each client. This class will <code>implement Runnable</code> so it can run on a separate thread.</p>

    <pre><code class="language-java">// File: ClientHandler.java
    import java.io.*;
    import java.net.*;

    public class ClientHandler implements Runnable {
        private Socket clientSocket;

        public ClientHandler(Socket socket) {
            this.clientSocket = socket;
        }

        public void run() {
            try {
                InputStream input = clientSocket.getInputStream();
                BufferedReader reader = new BufferedReader(new InputStreamReader(input));
                OutputStream output = clientSocket.getOutputStream();
                PrintWriter writer = new PrintWriter(output, true);

                String clientMessage;
                while ((clientMessage = reader.readLine()) != null) {
                    System.out.println("Received from " + clientSocket.getRemoteSocketAddress() + ": " + clientMessage);
                    if ("bye".equalsIgnoreCase(clientMessage)) {
                        break;
                    }
                    writer.println("Server received: " + clientMessage);
                }
            } catch (IOException e) {
                System.out.println("Client Handler Error: " + e.getMessage());
            } finally {
                try {
                    clientSocket.close();
                } catch (IOException e) {
                    // Ignore
                }
            }
        }
    }
    </code></pre>

    <p>Now, let's modify the main Server file. Instead of handling the client itself, it will create a new Thread for each connection.</p>

    <pre><code class="language-java">// File: MultiThreadedServer.java
    import java.io.*;
    import java.net.*;

    public class MultiThreadedServer {
        public static void main(String[] args) {
            try (ServerSocket serverSocket = new ServerSocket(6868)) {
                System.out.println("Multi-threaded server is running and waiting for connections...");

                while (true) { // Endless loop to always accept new clients
                    Socket clientSocket = serverSocket.accept();
                    System.out.println("New client connected: " + clientSocket.getRemoteSocketAddress());
                    
                    // Create a new thread to handle this client
                    ClientHandler clientHandler = new ClientHandler(clientSocket);
                    new Thread(clientHandler).start();
                }

            } catch (IOException ex) {
                System.out.println("Server Error: " + ex.getMessage());
            }
        }
    }
    </code></pre>

    <h4>Conclusion</h4>
    <p>With this structure, your Server is now ready to handle multiple connections simultaneously. This is the foundational architecture for most server-side network applications. You can open multiple terminal windows, run multiple <strong>SimpleClient</strong> instances, and you will see the Server handle all of them smoothly.</p>`,
        image: "image/img2.png"
    },
    {
    id: 3,
    title: "Sending and Receiving Objects Over a Network in Java using Serialization",
    category: "java",
    date: "18/10/2025",
    excerpt: "In previous articles, we only sent and received simple string data. In this one, you'll learn how to pass full Java objects directly over the network using Serialization...",
    content: `<h3>Sending and Receiving Objects Over a Network in Java using Serialization</h3>
    <p><strong>Author:</strong> Hieu's Story</p>
    <p><strong>Posted on:</strong> October 18, 2025</p>
    <p><strong>Category:</strong> Java Network Programming</p>

    <p>In previous articles, we only sent and received simple string data. But in reality, applications often need to exchange more complex data structures, such as student information, product details, or an order. Converting these objects to strings and then parsing the string on the receiving end is very cumbersome and error-prone.</p>

    <p>Fortunately, Java provides a powerful mechanism called <strong>Serialization</strong> to solve this problem completely. It allows "freezing" an object into a byte stream, sending it over the network, and "thawing" it back into the original object.</p>

    <h4>What is Serialization?</h4>
    <p><strong>Serialization</strong> is the process of converting the state of an object into a byte stream. Conversely, <strong>Deserialization</strong> is the process of recreating the object from that byte stream.</p>

    <p>For an object to be "frozen," its class must <code>implement</code> a marker interface called <code>java.io.Serializable</code>. This interface has no methods; it simply acts as a signal to the Java Virtual Machine (JVM) saying, "Hey, I allow objects of this class to be serialized!".</p>

    <h4>Example: Sending a Message Object</h4>
    <p>Let's create a simple <strong>Message</strong> class. This class will contain the sender's information and the message content.</p>

    <pre><code class="language-java">// File: Message.java
    import java.io.Serializable;

    // Important: must implement Serializable
    public class Message implements Serializable {
        private String sender;
        private String content;

        public Message(String sender, String content) {
            this.sender = sender;
            this.content = content;
        }

        @Override
        public String toString() {
            return "From '" + sender + "': " + content;
        }
    }
    </code></pre>

    <h4>Upgrading the Server and Client</h4>
    <p>Now, we will use <code>ObjectOutputStream</code> to send objects and <code>ObjectInputStream</code> to receive them.</p>

    <p><strong>Server-side:</strong></p>

    <pre><code class="language-java">// File: ObjectServer.java (Processing snippet)
    // ...
    try (ServerSocket serverSocket = new ServerSocket(6868)) {
        System.out.println("Object Server is running...");
        Socket clientSocket = serverSocket.accept();
        System.out.println("Client connected!");

        // Use ObjectInputStream to read the object
        ObjectInputStream ois = new ObjectInputStream(clientSocket.getInputStream());
        Message receivedMessage = (Message) ois.readObject(); // Read and cast
        System.out.println("Received: " + receivedMessage);

        // Use ObjectOutputStream to send an object
        ObjectOutputStream oos = new ObjectOutputStream(clientSocket.getOutputStream());
        Message responseMessage = new Message("Server", "I received your message!");
        oos.writeObject(responseMessage);

    } catch (IOException | ClassNotFoundException ex) {
        // ClassNotFoundException occurs if the class definition of the deserialized object isn't found
        System.out.println("Server Error: " + ex.getMessage());
    }
    // ...
    </code></pre>

    <p><strong>Client-side:</strong></p>

    <pre><code class="language-java">// File: ObjectClient.java (Processing snippet)
    // ...
    try (Socket socket = new Socket("localhost", 6868)) {
        // Send a Message object to the Server
        ObjectOutputStream oos = new ObjectOutputStream(socket.getOutputStream());
        Message messageToSend = new Message("Client", "This is an object!");
        oos.writeObject(messageToSend);

        // Receive a Message object from the Server
        ObjectInputStream ois = new ObjectInputStream(socket.getInputStream());
        Message serverResponse = (Message) ois.readObject();
        System.out.println("Response from Server: " + serverResponse);

    } catch (IOException | ClassNotFoundException ex) {
        System.out.println("Client Error: " + ex.getMessage());
    }
    // ...
    </code></pre>

    <h4>Final Words</h4>
    <p><strong>Serialization</strong> is an extremely powerful tool that simplifies the transmission of complex data over the network in Java. Instead of worrying about data formats, you can just focus on your application's business logic. However, be mindful of <strong>versioning</strong> and <strong>security</strong> issues when using serialization in large, complex systems.</p>`,
        image: "image/img3.png "
    },
    {
    id: 4,
    title: "Interacting with RESTful APIs in Java using HttpURLConnection",
    category: "java",
    date: "21/10/2025",
    excerpt: "Today, applications rarely operate in isolation. They frequently need to communicate with external services to fetch data, such as weather information, product lists, or new articles. The most common communication method is via RESTful APIs...",
    content: `<h3>Interacting with RESTful APIs in Java using HttpURLConnection</h3>
    <p><strong>Author:</strong> Hieu's Story</p>
    <p><strong>Posted on:</strong> October 21, 2025</p>
    <p><strong>Category:</strong> Java Network Programming</p>

    <p>Today, applications rarely operate in isolation. They frequently need to communicate with external services to fetch data, such as weather information, product lists, or new articles. The most common communication method is via RESTful APIs.</p>

    <p>In the world of pure Java (without external libraries), <strong>HttpURLConnection</strong> is the built-in tool to help you make these HTTP requests. Although its syntax is a bit verbose compared to modern libraries, understanding how it works will help you master the fundamentals of the HTTP protocol.</p>

    <h4>What is a RESTful API?</h4>
    <p>Simply put, a RESTful API is an architectural standard for designing web services. It uses familiar HTTP methods to perform actions:</p>

    <ul>
    <li><strong>GET:</strong> Retrieve data (e.g., get a user's information)</li>
    <li><strong>POST:</strong> Create new data (e.g., register a new account)</li>
    <li><strong>PUT:</strong> Update existing data</li>
    <li><strong>DELETE:</strong> Delete data</li>
    </ul>

    <p>Data is typically exchanged in JSON format.</p>

    <h4>Practice: Fetching Data from JSONPlaceholder</h4>
    <p>We will practice by calling <a href="https://jsonplaceholder.typicode.com/">JSONPlaceholder</a>, a free service that provides a fake API, to get information about a post.</p>

    <p><strong>URL:</strong> https://jsonplaceholder.typicode.com/posts/1</p>

    <pre><code class="language-java">// File: SimpleApiClient.java
    import java.io.BufferedReader;
    import java.io.InputStreamReader;
    import java.net.HttpURLConnection;
    import java.net.URL;

    public class SimpleApiClient {
        public static void main(String[] args) {
            try {
                // 1. Create URL object
                URL url = new URL("https://jsonplaceholder.typicode.com/posts/1");

                // 2. Open connection
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();

                // 3. Set request method (GET is default)
                connection.setRequestMethod("GET");

                // 4. Check response code (200 is OK)
                int responseCode = connection.getResponseCode();
                System.out.println("Response Code: " + responseCode);

                if (responseCode == HttpURLConnection.HTTP_OK) {
                    // 5. Read the response content
                    BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                    String inputLine;
                    StringBuilder response = new StringBuilder();

                    while ((inputLine = in.readLine()) != null) {
                        response.append(inputLine);
                    }
                    in.close();

                    // Print the JSON result
                    System.out.println("Response JSON: " + response.toString());
                } else {
                    System.out.println("GET request failed.");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }</code></pre>

    <p>When you run the program, you will see the response code <strong>200</strong> and a JSON string containing the details of post #1 printed to the console.</p>

    <h4>Sending Data with the POST Method</h4>
    <p>Sending data (e.g., creating a new post) is a bit more complicated. You need to write the JSON data to the connection's OutputStream.</p>

    <pre><code class="language-java">// File: PostRequestExample.java
    import java.io.OutputStream;
    import java.net.HttpURLConnection;
    import java.net.URL;

    public class PostRequestExample {
        public static void main(String[] args) {
            try {
                URL url = new URL("https://jsonplaceholder.typicode.com/posts");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();

                // 1. Set method to POST
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json; utf-8");
                connection.setRequestProperty("Accept", "application/json");

                // 2. Enable sending data
                connection.setDoOutput(true);

                // 3. JSON data to be sent
                String jsonInputString = "{\"title\": \"foo\", \"body\": \"bar\", \"userId\": 1}";

                // 4. Write data to the output stream
                try (OutputStream os = connection.getOutputStream()) {
                    byte[] input = jsonInputString.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                // 5. Print the response code
                int responseCode = connection.getResponseCode();
                System.out.println("Response Code: " + responseCode);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }</code></pre>

    <h4>Final Words</h4>
    <p>Using <strong>HttpURLConnection</strong> clearly shows the necessary steps to communicate via HTTP. Although in real projects, people often use libraries like <strong>OkHttp</strong> or <strong>Retrofit</strong> for more concise code, this foundational knowledge will never be redundant.</p>`,
        image: "image/img4.png"
    },
    {
    id: 5,
    title: "Building a Simple Chat Room Application using Java Sockets",
    category: "java",
    date: "25/10/2025",
    excerpt: "So far, we've gone through the most basic concepts of network programming in Java: Sockets, Multithreading, and data transfer. It's time to combine them all to build a more fun and practical project: a simple Chat Room...",
    content: `<h3>Building a Simple Chat Room Application using Java Sockets</h3>
    <p><strong>Author:</strong> Hieu's Story</p>
    <p><strong>Posted on:</strong> October 25, 2025</p>
    <p><strong>Category:</strong> Java Network Programming</p>

    <p>So far, we've gone through the most basic concepts of network programming in Java: <strong>Sockets</strong>, <strong>Multithreading</strong>, and <strong>data transfer</strong>. It's time to combine them all to build a more fun and practical project: a simple <strong>Chat Room</strong>.</p>

    <p>Our goal is to build a <strong>Server</strong> that can receive messages from any Client and broadcast that message to all other connected Clients. This is the operating model for many group chat applications.</p>

    <h4>Application Architecture</h4>
    <p>Our application will consist of two main components: <strong>Server</strong> and <strong>Client</strong>.</p>

    <p><strong>Server:</strong></p>
    <ul>
    <li>Uses <code>ServerSocket</code> to listen for new connections.</li>
    <li>Each time a client connects, create a separate <code>ClientThread</code> to handle it.</li>
    <li>Maintain a list (<code>List</code> or <code>Set</code>) containing all active clients to be able to send messages to everyone.</li>
    </ul>

    <p><strong>ClientThread (on Server):</strong></p>
    <ul>
    <li>Contains the logic to continuously read messages from a specific client.</li>
    <li>When a message is received, it will call a method on the Server to broadcast that message to all other clients.</li>
    </ul>

    <p><strong>Client:</strong></p>
    <ul>
    <li>Runs on the console, with two threads operating in parallel.</li>
    <li>One thread to send messages entered by the user.</li>
    <li>Another thread to listen for and display messages from the Server.</li>
    </ul>

    <h4>Server-side Source Code</h4>
    <p>The server needs a method to broadcast messages to all connected clients.</p>

    <pre><code class="language-java">// File: ChatServer.java
    import java.io.*;
    import java.net.*;
    import java.util.*;

    public class ChatServer {
        private int port;
        private Set&lt;PrintWriter&gt; clientWriters = new HashSet&lt;&gt;();

        public ChatServer(int port) {
            this.port = port;
        }

        public void start() {
            try (ServerSocket serverSocket = new ServerSocket(port)) {
                System.out.println("Chat Server is running on port " + port);
                while (true) {
                    new ClientHandler(serverSocket.accept()).start();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        // Method to broadcast a message to all clients
        private synchronized void broadcast(String message) {
            for (PrintWriter writer : clientWriters) {
                writer.println(message);
            }
        }

        // Inner class to handle each client separately
        private class ClientHandler extends Thread {
            private Socket socket;
            private PrintWriter writer;

            public ClientHandler(Socket socket) {
                this.socket = socket;
            }

            public void run() {
                try {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                    writer = new PrintWriter(socket.getOutputStream(), true);
                    
                    // Add the new client's writer to the set
                    synchronized (clientWriters) {
                        clientWriters.add(writer);
                    }

                    String message;
                    while ((message = reader.readLine()) != null) {
                        System.out.println("Received: " + message);
                        broadcast(message);
                    }
                } catch (IOException e) {
                    // Read/write error
                } finally {
                    // When client disconnects
                    if (writer != null) {
                        synchronized (clientWriters) {
                            clientWriters.remove(writer);
                        }
                    }
                    try {
                        socket.close();
                    } catch (IOException e) {}
                }
            }
        }

        public static void main(String[] args) {
            new ChatServer(6868).start();
        }
    }</code></pre>

    <h4>Client-side Source Code</h4>
    <p>The Client needs two threads: one to send user input, and another to receive and display messages from the Server.</p>

    <pre><code class="language-java">// File: ChatClient.java
    import java.io.*;
    import java.net.*;

    public class ChatClient {
        public static void main(String[] args) {
            try {
                Socket socket = new Socket("localhost", 6868);
                PrintWriter writer = new PrintWriter(socket.getOutputStream(), true);
                
                // Thread to read messages from server
                new Thread(() -> {
                    try {
                        BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                        String serverMessage;
                        while ((serverMessage = reader.readLine()) != null) {
                            System.out.println(serverMessage);
                        }
                    } catch (IOException e) {
                        System.out.println("Lost connection to server.");
                    }
                }).start();
                
                // Main thread reads input from console and sends it
                BufferedReader consoleReader = new BufferedReader(new InputStreamReader(System.in));
                System.out.print("Enter your name: ");
                String name = consoleReader.readLine();
                String userInput;
                while ((userInput = consoleReader.readLine()) != null) {
                    writer.println(name + ": " + userInput);
                }
                
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }</code></pre>

    <h4>Final Words</h4>
    <p>This project is an excellent testament to the power of combining <strong>Sockets</strong> and <strong>Multithreading</strong>. From this foundation, you can absolutely expand the system with features like private messages, a list of online users, or even integrate a user-friendly graphical interface using <strong>JavaFX</strong> or <strong>Swing</strong>.</p>`,
        image: "image/img5.png"
    },
    {
    id: 6,
    title: "Fetch API: The Modern Way to Make HTTP Requests in JavaScript",
    category: "javascript",
    date: "28/10/2025",
    excerpt: "Since JavaScript ES6, the Fetch API has become the standard and powerful way to send HTTP requests. It makes loading data or sending info to a server much easier, more flexible, and more modern than $.ajax...",
    content: `<h3>Fetch API: The Modern Way to Make HTTP Requests in JavaScript</h3>
    <p><strong>Author:</strong> Hieu's Story</p>
    <p><strong>Posted on:</strong> October 28, 2025</p>
    <p><strong>Category:</strong> JavaScript Network Programming</p>

    <p>Back in the jQuery days, many of you were probably familiar with <code>\$.ajax</code>. But since JavaScript ES6, we've had a more powerful and modern tool built directly into the browser for handling network requests: <strong>Fetch API</strong>.</p>

    <p>If you want your website to be able to load new data or send information to the server without reloading the entire page, then Fetch API is a skill you can't miss. It uses <strong>Promises</strong> to handle asynchronous tasks, making your code much cleaner and easier to manage.</p>

    <h4>Your First GET Request</h4>
    <p>The basic use of <code>fetch</code> is to pass in the URL of the resource you want to get. <code>fetch</code> will return a <strong>Promise</strong>.</p>

    <p>A Promise is like a guarantee: "I will go get the data for you, and when I have a result (success or failure), I will let you know." We use the <code>.then()</code> method to handle when the "promise" is fulfilled.</p>

    <p>Let's try getting data from <strong>JSONPlaceholder</strong>:</p>

    <pre><code class="language-javascript">console.log("Starting data fetch...");

    fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then(response => {
        // response.json() also returns a Promise
        return response.json(); 
    })
    .then(data => {
        // Now we actually have the data
        console.log("Data fetched successfully!");
        console.log(data);
    })
    .catch(error => {
        // .catch() is called if there's an error during the fetch
        console.error("An error occurred:", error);
    });

    console.log("Request has been sent, awaiting results...");</code></pre>

    <p>If you open the browser's <strong>Console</strong> and run the code above, you'll see the <code>console.log</code> lines at the beginning and end run first, and only after a moment will the data be printed. That is the nature of <strong>asynchronicity</strong>.</p>

    <h4>Sending Data with a POST Request</h4>
    <p>To send data, we need to provide an additional options object to <code>fetch</code>, specifying:</p>
    <ul>
    <li><code>method: 'POST'</code></li>
    <li><code>headers</code>: To let the server know what kind of data we're sending (usually JSON)</li>
    <li><code>body</code>: The data to be sent, converted to a JSON string using <code>JSON.stringify()</code></li>
    </ul>

    <pre><code class="language-javascript">const newPost = {
    title: 'New Post Title',
    body: 'Content of the post',
    userId: 10
    };

    fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(newPost)
    })
    .then(response => response.json())
    .then(data => {
    console.log("Post created successfully:");
    console.log(data); // Server returns the created object with an id
    })
    .catch(error => {
    console.error("Error creating post:", error);
    });</code></pre>

    <h4>Final Words</h4>
    <p><strong>Fetch API</strong> is an extremely flexible and powerful tool, serving as the foundation for all modern dynamic web applications. By mastering it, you can create smooth user experiences, loading data in the background without interrupting them. In the next post, we'll learn how to make this syntax even cleaner with <strong>async/await</strong>.</p>`,
        image: "image/img6.png"
    },
    {
    id: 7,
    title: "Mastering Asynchronicity in JavaScript: From Callbacks to Promises and Async/Await",
    category: "javascript",
    date: "01/11/2025",
    excerpt: "When working with network tasks in JavaScript, you can't avoid the concept of asynchronicity. From Callback Hell to Promises and Async/Await, this journey shows JavaScript's powerful evolution in handling async operations...",
    content: `<h3>Mastering Asynchronicity in JavaScript: From Callbacks to Promises and Async/Await</h3>
    <p><strong>Author:</strong> Hieu's Story</p>
    <p><strong>Posted on:</strong> November 01, 2025</p>
    <p><strong>Category:</strong> JavaScript Network Programming</p>

    <p>When working with network tasks in JavaScript, there's one concept you cannot avoid: <strong>asynchronicity</strong>. Just imagine, if you sent a request to get data and your entire website "froze" until the result came back, how terrible would the user experience be!</p>

    <p>JavaScript solves this problem by <em>not waiting</em>. It sends the request and continues to execute other tasks. When the result is available, it will be processed later. Over time, JavaScript has had many different syntaxes to manage this asynchronicity. Let's look back at that journey.</p>

    <h4>The Early Days: Callbacks</h4>
    <p>A <strong>Callback</strong> is a function passed into another function as an argument, which will be called when the task is complete.</p>

    <pre><code class="language-javascript">// This is illustrative code, it won't run
    function fetchData(url, successCallback, errorCallback) {
    // simulate sending a request
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.onload = function() {
        if (request.status === 200) {
        successCallback(request.responseText);
        } else {
        errorCallback(request.status);
        }
    };
    request.send();
    }

    // The problem: "Callback Hell"
    fetchData('api/posts/1', function(post) {
    console.log(post);
    fetchData(\`api/users/\${post.userId}\`, function(user) {
        console.log(user);
        fetchData(\`api/comments/\${post.id}\`, function(comments) {
        console.log(comments);
        // And so on, nested together, very hard to read and maintain
        });
    });
    });</code></pre>

    <p>The biggest problem with callbacks is that when you have many dependent tasks, you fall into <strong>"Callback Hell"</strong> with deeply nested functions that are very difficult to read and maintain.</p>

    <h4>The Revolution: Promises</h4>
    <p><strong>Promises</strong> were born to solve "Callback Hell." A Promise represents the eventual result of an asynchronous task. It has three states: <em>pending</em>, <em>fulfilled</em> (successful), or <em>rejected</em> (failed).</p>

    <p>We can "chain" actions using <code>.then()</code> and handle errors centrally using <code>.catch()</code>.</p>

    <pre><code class="language-javascript">fetch('https://jsonplaceholder.typicode.com/posts/1')
    .then(response => response.json())
    .then(post => {
        console.log("Post fetched successfully:", post.title);
        // Return a new Promise
        return fetch(\`https://jsonplaceholder.typicode.com/users/\${post.userId}\`);
    })
    .then(response => response.json())
    .then(user => {
        console.log("User fetched successfully:", user.name);
    })
    .catch(error => {
        console.error("An error occurred in the Promise chain:", error);
    });</code></pre>

    <p>The code is now much flatter and easier to read!</p>

    <h4>The Ultimate Syntax: Async/Await</h4>
    <p><strong>Async/Await</strong> is a layer of "syntactic sugar" built on top of Promises, helping us write asynchronous code that looks synchronous.</p>

    <ul>
    <li><strong>async</strong>: Placed before a function to declare that it will contain asynchronous tasks. An async function always returns a Promise.</li>
    <li><strong>await</strong>: Can only be used inside an async function. It will "pause" the function's execution until the Promise is resolved and returns the result.</li>
    </ul>

    <pre><code class="language-javascript">async function getPostInfo() {
    try {
        console.log("Starting execution...");
        
        // Pause here until the fetch is complete
        const postResponse = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        const post = await postResponse.json();
        console.log("Post:", post.title);
        
        // Continue pausing here
        const userResponse = await fetch(\`https://jsonplaceholder.typicode.com/users/\${post.userId}\`);
        const user = await userResponse.json();
        console.log("Author:", user.name);

        console.log("Completed!");
    } catch (error) {
        console.error("Error in async function:", error);
    }
    }

    getPostInfo();</code></pre>

    <p>The code now looks sequential, clean, and extremely easy to understand, as if you're reading a story.</p>

    <h4>Final Words</h4>
    <p>Understanding the journey from <strong>Callbacks</strong> to <strong>Async/Await</strong> helps you better appreciate modern syntax and know how to handle asynchronous situations most effectively. Today, <strong>Async/Await</strong> is the gold standard when working with network tasks in JavaScript.</p>`,
        image: "image/img7.png"
    },
    {
    id: 8,
    title: "JS Project: Build a Weather App using JavaScript and a Public API",
    category: "javascript",
    date: "05/11/2025",
    excerpt: "Let's build a simple weather application using Fetch API, Async/Await, and OpenWeatherMap to display real-time weather information...",
    content: `
    <p>Theory is necessary, but the best way to solidify knowledge is through practice. Today, we will build a small but extremely practical project together: a simple web application to view weather information for any city.</p>

    <p>This project will help you apply the skills you've learned: working with the Fetch API, handling Promises with Async/Await, and manipulating the DOM to display data on the interface. Let's get started!</p>

    <h3>Step 1: Get an API Key</h3>

    <p>To get weather data, we need to use a third-party service. One of the most popular services with a free tier is <strong>OpenWeatherMap</strong>.</p>

    <ol>
    <li>Go to the <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap</a> website.</li>
    <li>Sign up for a free account.</li>
    <li>After logging in, go to the "API keys" section to get your key. Save this key; we'll need it shortly.</li>
    </ol>

    <h3>Step 2: Design the HTML Interface</h3>

    <p>Our interface is very simple. We just need an input box for the user to type the city name, a button, and an area to display the results.</p>

    <pre><code class="language-html">
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Weather App</title>
        <link rel="stylesheet" href="style.css">
    </head><body>
        <div class="weather-container">
            <h1>Check the Weather</h1>
            <div class="search-box">
                <input type="text" id="city-input" placeholder="Enter city name...">
                <button id="search-btn">Search</button>
            </div>
            <div id="weather-result" class="hidden">
                <h2 id="city-name"></h2>
                <p id="temperature"></p>
                <p id="description"></p>
            </div>
        </div>
        <script src="app.js"></script>
    </body>
    </html>
    </code></pre>

    <h3>Step 3: Write the JavaScript Code</h3>

    <p>This is the core part. We will write an async function to call the API and update the interface.</p>

    <pre><code class="language-javascript">
    // File: app.js
    const apiKey = 'YOUR_API_KEY_HERE'; // <--- REPLACE WITH YOUR API KEY
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const weatherResultDiv = document.getElementById('weather-result');

    searchBtn.addEventListener('click', () => {
        const cityName = cityInput.value.trim();
        if (cityName) {
            getWeather(cityName);
        }
    });

    async function getWeather(city) {
        // We use lang=en for English descriptions
        const apiUrl = \`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${apiKey}&units=metric&lang=en\`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('City not found!');
            }
            const data = await response.json();
            displayWeather(data);
        } catch (error) {
            alert(error.message);
        }
    }

    function displayWeather(data) {
        document.getElementById('city-name').textContent = data.name;
        document.getElementById('temperature').textContent = \`Temperature: \${data.main.temp}°C\`;
        document.getElementById('description').textContent = \`Description: \${data.weather[0].description}\`;
        
        weatherResultDiv.classList.remove('hidden');
    }
    </code></pre>

    <h3>Final Words</h3>

    <p>With just a bit of HTML and a few dozen lines of JavaScript, you've created a complete application that can interact with a real-world web service. This is a great example of the power of APIs and JavaScript in building dynamic web applications. You can try expanding the project by adding weather icons, a multi-day forecast, or saving the user's favorite city.</p>
    `,
    image: "image/img8.png"
    },
    {
    id: 9,
    title: "Understanding WebSockets in JavaScript for Real-Time Communication",
    category: "javascript",
    date: "10/11/2025",
    excerpt: "WebSocket delivers two-way communication between Client and Server in real-time, ideal for chat apps, games, or stock tickers.",
    content: `
    <p>We are very familiar with the Client-Server communication model via HTTP: Client sends a request, Server returns a response. This model works very well for web browsing or calling APIs. But what if you want to build applications that need continuous, real-time data updates like chat apps, live stock tickers, or push notifications? Having the Client constantly send requests (polling) to ask "Anything new?" is extremely wasteful of resources.</p>

    <p>This is where <strong>WebSocket</strong> shines. It creates a persistent, two-way communication channel between the Client and Server, allowing the Server to proactively push data down to the Client at any time.</p>

    <h3>How is WebSocket different from HTTP?</h3>

    <p><strong>HTTP/HTTPS</strong>: Is a one-way (request-response) protocol. Each request is a separate connection (or is reused short-term). The Server cannot arbitrarily send data to the client.<br>
    <strong>WebSocket (Protocol ws:// or wss://)</strong>: After an initial "handshake" over HTTP, the connection is "upgraded" to a WebSocket connection. This connection is kept open, allowing both the Client and Server to send data to each other at any time without a new request.</p>

    <h3>Using WebSocket on the Client-side (JavaScript)</h3>

    <p>The WebSocket API in the browser is very simple and easy to use.</p>

    <pre><code class="language-javascript">
    // Create a new WebSocket connection
    // You need a WebSocket server running at this address
    const socket = new WebSocket('wss://echo.websocket.events');

    // Event fired when the connection is successfully opened
    socket.onopen = function(event) {
    console.log("Connected to WebSocket Server!");
    // Send a message to the server
    socket.send("Hello Server, I am the Client!");
    };

    // Event fired when a message is received from the server
    socket.onmessage = function(event) {
    console.log("Received from Server: ", event.data);
    };

    // Event fired when an error occurs
    socket.onerror = function(error) {
    console.error("WebSocket Error: ", error);
    };

    // Event fired when the connection is closed
    socket.onclose = function(event) {
    console.log("Connection closed.");
    if (event.wasClean) {
        console.log(\`Connection closed cleanly, code=\${event.code}, reason=\${event.reason}\`);
    } else {
        // e.g., server went down
        console.log('Connection was dropped');
    }
    };
    </code></pre>

    <p>To test quickly, you can use <code>wss://echo.websocket.events</code>, a public service that will echo back anything you send it.</p>

    <h3>When to use WebSocket?</h3>

    <p>WebSocket is the ideal choice for applications requiring low latency and real-time data updates, for example:</p>

    <ul>
    <li>Chat applications: Send and receive messages instantly.<br></li>
    <li>Multiplayer online games: Update positions and actions of other players.<br></li>
    <li>Financial applications: Display continuously fluctuating stock prices, cryptocurrencies.<br></li>
    <li>Notifications: Server pushes new alerts down to the user.<br></li>
    <li>Online collaboration tools (like Google Docs): Update changes from others in real-time.</li>
    </ul>

    <h3>Final Words</h3>

    <p>WebSocket has opened a new era for real-time web applications. By providing an efficient two-way communication channel, it helps developers build more interactive and lively experiences than ever before. Although building a WebSocket Server (e.g., with Node.js using the 'ws' library or Socket.IO) is more complex than the client side, understanding how it works will give you a significant advantage.</p>
    `,
    image: "image/img9.png"
    }
];

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    initializeAppBlog();
});

function initializeAppBlog() {
    renderBlogPosts();
    initializeFilters();
    initializeBlogCardAnimations();
    
    const openSearchBtn = document.getElementById('open-search-btn');
    const closeSearchBtn = document.getElementById('close-search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results-container');

    if (openSearchBtn) {
        openSearchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            searchInput.focus(); // Tự động focus vào ô input
        });
    }

    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
            searchInput.value = ''; // Xóa nội dung tìm
            searchResultsContainer.innerHTML = ''; // Xóa kết quả
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
    }// Thêm hàm này để chạy hiệu ứng
}

// ===== HIỂN THỊ CÁC BÀI VIẾT BLOG =====
function renderBlogPosts() {
    const container = document.getElementById('blog-container');
    if (!container) return;
    container.innerHTML = '';

    blogPosts.forEach(post => {
        const card = createBlogCard(post);
        container.appendChild(card);
    });
}

function createBlogCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.setAttribute('data-category', post.category);

    card.innerHTML = `
        <img src="${post.image}" alt="${post.title}" class="blog-image">
        <div class="blog-content">
            <span class="blog-category">${post.category.toUpperCase()}</span>
            <h3>${post.title}</h3>
            <div class="blog-date">📅 ${post.date}</div>
            <p class="blog-excerpt">${post.excerpt}</p>
            <a href="#" class="read-more">Đọc tiếp →</a>
        </div>
    `;

    // Cải tiến: Nhấp vào bất kỳ đâu trên thẻ cũng sẽ mở bài viết
    card.addEventListener('click', (e) => {
        e.preventDefault(); // Ngăn hành vi mặc định của thẻ <a>
        showPostDetail(post);
    });

    return card;
}


// ===== CHỨC NĂNG LỌC BÀI VIẾT =====
function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length === 0) return;
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            filterPosts(filter);
        });
    });
}

function filterPosts(category) {
    const blogContainer = document.getElementById('blog-container');
    const certificatesContainer = document.getElementById('certificates-container');
    const blogCards = blogContainer.querySelectorAll('.blog-card');

    // --- BẮT ĐẦU SỬA ---

    // 1. Điều khiển việc hiển thị của các container chính
    if (category === 'all') {
        // Nếu là 'Tất Cả', hiển thị CẢ blog VÀ chứng chỉ
        blogContainer.style.display = 'grid';
        certificatesContainer.style.display = 'grid';
    } else if (category === 'certificates') {
        // Nếu là 'Chứng chỉ', chỉ hiển thị chứng chỉ
        blogContainer.style.display = 'none';
        certificatesContainer.style.display = 'grid';
    } else {
        // Nếu là 'Java' hoặc 'JavaScript', chỉ hiển thị blog
        blogContainer.style.display = 'grid';
        certificatesContainer.style.display = 'none';
    }

    // 2. Lọc các thẻ bài viết blog bên trong blogContainer
    // Logic này vẫn chạy đúng cho mọi trường hợp
    blogCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
            // Hiển thị thẻ nếu:
            // 1. Đang chọn 'Tất Cả'
            // 2. Thẻ có category trùng với category đang chọn
            card.style.display = 'block';
        } else {
            // Ẩn thẻ đi
            card.style.display = 'none';
        }
    });
}

// ===== HIỆU ỨNG THẺ KHI CUỘN (Sao chép từ script.js) =====
function initializeBlogCardAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.blog-card, .certificate-card').forEach(el => { // Cập nhật để lấy cả certificate-card
        el.style.opacity = '0'; // Đảm bảo thẻ ẩn ban đầu để hiệu ứng hoạt động
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===== HIỂN THỊ CHI TIẾT BÀI VIẾT (MODAL) =====
function showPostDetail(post) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <img src="${post.image}" alt="${post.title}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px; margin-bottom: 1.5rem;">
            <div class="modal-body">
                 ${post.content}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // Ngăn cuộn trang nền

    // Chức năng đóng modal
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = 'auto';
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    }, { once: true });
}
// Dán 2 hàm này vào cuối file blog.js

function performSearch(searchTerm) {
    const resultsContainer = document.getElementById('search-results-container');
    if (!searchTerm) {
        resultsContainer.innerHTML = '';
        return;
    }

    const lowerCaseTerm = searchTerm.toLowerCase();

    /// 1. Lọc trong mảng blogPosts và "tag" loại
    const blogResults = blogPosts.filter(post => 
        post.title.toLowerCase().includes(lowerCaseTerm) || 
        post.excerpt.toLowerCase().includes(lowerCaseTerm)
    ).map(post => ({ ...post, type: 'blog' })); // Thêm type: 'blog'

    // 2. Lọc trong mảng galleryItems và "tag" loại
    // (Biến galleryItems đã có sẵn do chúng ta đã tải file gallery.js)
    const galleryResults = galleryItems.filter(item =>
        item.title.toLowerCase().includes(lowerCaseTerm) ||
        item.description.toLowerCase().includes(lowerCaseTerm)
    ).map(item => ({ ...item, type: 'gallery' })); // Thêm type: 'gallery'

    // 3. Gộp cả hai kết quả
    const results = [...blogResults, ...galleryResults];

    displaySearchResults(results);
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results-container');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>Không tìm thấy kết quả nào.</p>';
        return;
    }

    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'search-result-item';

        // Lấy văn bản mô tả dựa trên 'type'
        const text = result.type === 'blog' ? result.excerpt : result.description;

        item.innerHTML = `
            <h4>${result.title}</h4>
            <p>${text}</p>
            <span class="blog-category" style="font-size: 0.8rem;">
                ${result.type === 'blog' ? 'Bài viết' : 'Gallery'}
            </span>
        `;

        // Thêm sự kiện click dựa trên 'type'
        item.addEventListener('click', () => {
            if (result.type === 'blog') {
                showPostDetail(result); // Gọi hàm của blog.js
            } else {
                showGalleryModal(result); // Gọi hàm của gallery.js
            }

            // Đóng overlay tìm kiếm
            document.getElementById('search-overlay').classList.remove('active');
            document.getElementById('search-input').value = '';
            resultsContainer.innerHTML = '';
        });
        resultsContainer.appendChild(item);
    });
}