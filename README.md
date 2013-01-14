ucltt-ics is a HTTP-based iCalendar interface for the timetable system used at
UCL so that it can be synced to "normal" calendar software. It is fairly crude,
but seems to work mostly the way it should. Username and password is passed
through HTTP basic.

If you want to use this with Google Calendar which doesn't support HTTP Basic
Auth, you can, for instance, use Yahoo! Pipes to create a public URL where the
user/pass are stored at Yahoo!'s servers.

Note that this server runs over HTTP, which means passwords are transmitted in
cleartext. Just something to bear in mind.
