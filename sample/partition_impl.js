gauge.partition("albums - with rating - Excellent", () => {
    return [{ "Artist Name": "AC/DC", "Album Name": "Let There Be Rock" }, { "Artist Name": "AC/DC", "Album Name": "For Those About To Rock We Salute You" }];
});

gauge.partition("albums - more than <number> number of tracks", (number) => {
    return [{ "Artist Name": "Accept", "Album Name": "Restless and Wild" }];
});


gauge.partition("albums - with <duration> duration  of tracks", (duration) => {
    return [{ "Artist Name": "AC/DC", "Album Name": "Let There Be Rock" }, { "Artist Name": "Accept", "Album Name": "Balls to the Wall" }];
});

gauge.partition("buyer - new", (number) => {
    return [{ Name: "Bob", Address: "Chennai" }];
});

gauge.partition("buyer - existing", (number) => {
    return [{ Name: "Sam", Address: "Bangalore" }];
});
