# term2-midterm
## Proposal:
 ![Project Proposal](https://github.com/PrimeGoat/term2-midterm/blob/master/proposal.png)

# README:



The Nova chatbot is a web-based AI-powered chat bot that talks to you.  Aside from this primary feature, it also features a number of functions that fulfill the project requirements.  This includes this readme, a certain amount of routes, registration, user info modification, login/logout, and an about page.

The chatbot itself is able to speak to the user by recognizing their speech and determining the intent and context of what the user is saying.  It then responds with a speaking voice.  Certain features like the weather report also provide visual output inside the green output buffer box.

## The technologies that are used:
* Express
* MongoDB (database for storing user information)
* Passport (for authentication)
* Google Cloud's DialogFlow (for natural language processing)
* Heroku application hosting platform
* MongoDB Atlas

## Routes:
There were supposed to be PUT and DELETE routes, but HTML forms only support GET and POST, so I had to change the PUT and DELETE routes to POST.  Otherwise I would have used them as appropriate.  This is an annoying limitation of HTML.

* `GET /`: The main page.
* `GET /bot`: The chat bot.
* `GET /register`: Registration form.  This allows you to register, after which it emails you a password that you then have to update before you can log in.
* `GET /login`: Enter your email address and password to log in.
* `GET /thankyou`: Thanks you for registering and tells you to chcek your email for your temporary password.
* `GET /about`: Provides information about the technologies used in this project.
* `GET /updatepassword`: Lets you update your password.
* `GET /logoug`: Logs you off.
* `POST /api/v1/register`:
* `GET /api/v1/deleteuser`:
* `GET /api/v1/passcheck`:
* `POST /api/v1/login`:
* `POST /api/v1/updatepassword`:
* `POST /api/v1/updateuser`:
* `GET /api/v1/userinfo`:

## Environment Variables
* `SECRET`: Used by CookieParser.
* `MONGODB_URI`: The MongoDB URI for use by Mongoose.  This points to the database that is used for session and user data.
* `SESSION_SECRET`: For use by the session system to encrypt the session info in the cookies.
* `MJ_APIKEY_PUBLIC`: The MailJet API public key.
* `MJ_APIKEY_PRIVATE` The MailJet API private key.
* `PROJECTID`: The Google Cloud DialogFlow project ID.

## Cloning the project
If you want to use the project yourself, you need to create a Google Cloud account, read the DialogFlow documentation and set up an agent, which will be used by this app.  The agent then needs to be set up with intents, contexts, and whatever other features and functionality you would like it to have.
