ucltt-ics is a HTTP-based iCalendar interface for the timetable system used at
UCL so that it can be synced to "normal" calendar software. It is fairly crude,
but seems to work mostly the way it should. Username and password is set in
config or passed through HTTP basic authentication.

If a username is set in the config, HTTP basic auth is completely disabled.

If you want to use this with Google Calendar which doesn't support HTTP Basic
Auth, you should just set a fixed username and password in the config.

Note that this server runs over HTTP, which means passwords are transmitted in
cleartext if you use basic auth. Just something to bear in mind.

To run:

    npm config set ucltt-ics:username "your-ucl-username"
    npm config set ucltt-ics:password "your-ucl-password"
    npm start

You will then be able to access the iCalendar at http://yourdomain.com:54321/ and
can put that URL straight into your calendaring application to have it synced.
Beware that since this is doing web scraping, you might not want to scrape it
too often.
