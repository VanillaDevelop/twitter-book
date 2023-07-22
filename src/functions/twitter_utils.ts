import { Profile, Scraper, Tweet } from "@the-convocation/twitter-scraper";

const scraper = new Scraper();

export async function get_tweet_generator(id : string) : Promise<AsyncGenerator<Tweet, void, unknown>>
{
    const tweetGenerator = scraper.getTweetsByUserId(id, 5)
    
    return tweetGenerator;
}

export async function login_to_scraper(username : string, password : string) : Promise<void>
{
    await scraper.login(username, password)
    console.log(scraper.isLoggedIn)
}

export async function get_user_profile(username : string) : Promise<Profile>
{
    const user = await scraper.getProfile(username);
    return user;
}

export async function test_login()
{
  const scraper = new Scraper({
    transform: {
      request(input, init) {
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

    await scraper.login("a", "b");
    console.log("Logged in: " + await scraper.isLoggedIn());
}