module.exports = async function (context, req) {
    context.log('HTTP trigger function processed a request. RedirectToUrlBasedOnLocale START');
    let ip = (req.headers['x-forwarded-for'] || req.connection?.remoteAddress || "173.166.164.121").split(":")[0];
    context.log('IP: ' + ip);
    const url = await determineUrl(decodeURIComponent(req.query.template), ip);
    context.log('URL: ' + url);
    context.log('HTTP trigger function processed a request. RedirectToUrlBasedOnLocale FINISH');
    context.res = {
        status: 302,
        headers: {
          Location: url
        }
      };
}

async function determineUrl(template, ip) {
    // Use an IP geolocation API to retrieve the user's country
    let countryCode = await getCountryCodeFromIp(ip);
    let url = template.replace("{_}", countryCode);
    try {
      await testUrl(url);
    } catch (error) {
      url = template.replace("{_}", "US");
    }
    return url;
}

async function getCountryCodeFromIp(ip){
  const token = "91509ea2eeac405fbb1b6e535dd1a3c0";
  const countryCode = await fetch(`https://api.findip.net/${ip}/?token=${token}`)
                        .then(response => response.json())
                        .then(data => {
                            return data?.country?.iso_code || "US";
                        });               
  return countryCode;
}

async function testUrl(url) {
  const response = await fetch(url);
  if (response.status === 404) {
    throw new Error('URL not found');
  }
  return url;
}