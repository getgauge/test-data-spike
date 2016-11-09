gauge.partition("albums - based on duration of tracks - M", () => {
    return [{ "Artist Name": "Accept", "Album Name": "Balls to the Wall" }];
});

gauge.partition("albums - based on duration of tracks - S", () => {
	return [{ "Artist Name": "AC/DC", "Album Name": "For Those About To Rock We Salute You" }];
});

gauge.partition("albums - based on rating - Excellent", () => {
    return [{ "Artist Name": "AC/DC", "Album Name": "Let There Be Rock" }];
});

gauge.partition("albums - based on rating - Good", () => {
    return [];
});

gauge.partition("albums - based on number of tracks - less than <number>", (number) => {
    return [{ "Artist Name": "Accept", "Album Name": "Restless and Wild" }];
});
