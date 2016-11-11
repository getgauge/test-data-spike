gauge.partition("albums - with rating - Excellent", () => {
    return [{ "Artist Name": "AC/DC", "Album Name": "Let There Be Rock" }, { "Artist Name": "AC/DC", "Album Name": "For Those About To Rock We Salute You" }];
});

gauge.partition("albums - based on number of tracks - more than <number>", (number) => {
    return [{ "Artist Name": "Accept", "Album Name": "Restless and Wild" }];
});


gauge.partition("albums - based on duration  of tracks - S", () => {
    return [];
});

gauge.partition("albums - based on duration  of tracks - M", () => {
    return [{ "Artist Name": "Accept", "Album Name": "Balls to the Wall" }];
});

gauge.partition("albums - based on duration  of tracks - L", () => {
    return [{ "Artist Name": "AC/DC", "Album Name": "Let There Be Rock" }];
});

gauge.partition("buyer - new", () => {
    return [{ Name: "Bob", Address: "Chennai" }];
});

gauge.partition("buyer - existing", () => {
    return [{ Name: "Sam", Address: "Bangalore" }];
});
