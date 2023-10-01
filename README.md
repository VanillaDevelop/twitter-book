# Twitter Book Generator

The Twitter Book Generator is an Electron+React application that collects all of a user's tweets and relevant context, and displays it in a three-column grid on an A4-page layout.

  

## How it Works

The application uses the Twitter archive data as a base. Users can request their personal Twitter data on [the Twitter website](https://twitter.com/settings/download_your_data). The data is typically available after around ~24 hours. From this archive, all tweets of the user are extracted.

However, many tweets rely on external context in the form of retweets, QRTs, or replies. The app uses a [Twitter Scraping Library](https://github.com/the-convocation/twitter-scraper) to collect these external contextual tweets recursively, including information such as the display name and profile picture of their authors.

We then apply styling to render an A4-shaped page at a 300 PPI resolution. Specifically, our measurements for each page are as follows:

- A4 page = 210mm x 297mm
- A4 at 300 PPI = 2480 x 3508
- A4 margins: 0.5 inch outer/upper, 1 inch lower, 0.75 inch inner
- A4 margins at 300 PPI: 150px outer/upper, 300px lower, 227px inner (to even out cols)
- Content space vertical: 3508px - 150px - 300px = 3058px
- Content space horizontal: 2480px - 227px - 150px = 2103px (701px/col.)
- tweet_sidepanel = 100px
- tweet_content = 701px-100px=601px

We then use [react-to-print](https://www.npmjs.com/package/react-to-print) to send the resulting component to a print interface. 


## Why


Funi.

Honestly, I first came up with this project idea about 3 years ago. I've been posting on Twitter for years, and back then, I just wanted to have a physical archive of the stuff I've shitposted since I was 16 years old or so.

Then the elongated musketoon came along. Twitter's probably got about 12 months of lifetime tops at this point. For me, I have a lot of memories on that platform, and I don't really want to see them disappear entirely.

This project will probably not work for very long. I already could not use the official Twitter API for this project anymore, because of insane rate limits for the free version. Recently, Twitter implemented rate limits on their frontend endpoints, meaning that to get all of the context to your tweets via the scraper, you might already have to wait a few days or use VPNs. Also, endpoints seem to gradually disappear, or the [internal API endpoints will just randomly change](https://github.com/the-convocation/twitter-scraper/issues/49). 

So, use it or lose it, as they say. At the very least, get your own tweets off of Twitter before they make you pay to use the "service" to begin with.