# About #
ucltt-ics is a HTTP-based iCalendar interface for the timetable system used at
UCL so that it can be synced to "normal" calendar software. It is fairly crude,
but seems to work mostly the way it should. Username and password is set in
config or passed through HTTP basic authentication.

# Details #
If a username is set in the config, HTTP basic auth is completely disabled.

If you want to use this with Google Calendar which doesn't support HTTP Basic
Auth, you should just set a fixed username and password in the config.

Note that this server runs over HTTP, which means passwords are transmitted in
cleartext if you use basic auth. Just something to bear in mind.

# Running standalone #
To run:

    export UCL_USERNAME=...
    export UCL_PASSWORD=...
    npm start

You will then be able to access the iCalendar at http://yourdomain.com:54321/ and
can put that URL straight into your calendaring application to have it synced.
Beware that since this is doing web scraping, you might not want to scrape it
too often.

# Heroku #
The app is built so it can be run off Heroku. If you don't know what that is or
how to do it, you can either follow the [Heroku
guide](https://api.heroku.com/signup/devcenter) or follow these quick steps:

  1. [Sign up](https://api.heroku.com/signup/devcenter)
  2. ```heroku login```
  3. ```heroku create <app name>```
  4. ```git push heroku master```
  5. ```heroku ps:scale web=1```
  6. ```heroku config:add UCL_USERNAME=<your_username>```
  7. ```heroku config:add UCL_PASSWORD=<your_password>```
  8. ```heroku open```

Enjoy free hosting of the app.

# Why? #
Well, I was annoyed at having to log in to the UCL Timetable portal all the
time, so I figured I'd do something about it. Had I taken the time to actually
look around for a bit, I would have noticed that there was already a WebCal
subscription URL built in, but I didn't see that until I'd finished. At least I
got the experience of getting to play with Node and Heroku.
