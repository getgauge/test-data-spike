gauge.partition("albums - based on duration of tracks - M", () => {
    return [{ "Artist Name": "Artist2", "Album Name": "Album2" }];
});

gauge.partition("albums - based on duration of tracks - S", () => {
	return [{ "Artist Name": "Artist1", "Album Name": "Album1" }];
});

gauge.partition("albums - based on rating - Excellent", () => {
    return [{ "Artist Name": "Artist1", "Album Name": "Album1" }];
});

gauge.partition("albums - based on rating - Good", () => {
    return [];
});

gauge.partition("albums - based on number of tracks - less than <number>", (number) => {
    return [{ "Artist Name": "Artist2", "Album Name": "Album2" }];
});
