ucltt-ics is a HTTP-based iCalendar interface for the timetable system used at
UCL so that it can be synced to "normal" calendar software. It is fairly crude,
but seems to work mostly the way it should. Username and password is set in
config or passed through HTTP basic authentication.

If you want to use this with Google Calendar which doesn't support HTTP Basic
Auth, you should just set a fixed username and password in the config.

Note that this server runs over HTTP, which means passwords are transmitted in
cleartext if you use basic auth. Just something to bear in mind.
