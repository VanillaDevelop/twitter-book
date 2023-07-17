import { Scraper } from "@the-convocation/twitter-scraper";

const scraper = new Scraper({
    transform: {
      request(input: RequestInfo | URL, init?: RequestInit) {
        // The arguments here are the same as the parameters to fetch(), and
        // are kept as-is for flexibility of both the library and applications.
        if (input instanceof URL) {
          const proxy =
            "https://corsproxy.io/?" +
            encodeURIComponent(input.toString());
          return [proxy, init];
        } else if (typeof input === "string") {
          const proxy =
            "https://corsproxy.io/?" + encodeURIComponent(input);
          return [proxy, init];
        } else {
          // Omitting handling for example
          throw new Error("Unexpected request input type");
        }
      },
    },
  });

export async function test_tweet() : Promise<string>
{
    const latestTweet = await scraper.getLatestTweet("twitter");
    if (latestTweet) {
        return latestTweet.text!
    }
    return "No tweet found"
}