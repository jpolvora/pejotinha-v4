
async function test() {
  const apiKey = process.argv[2];
  if (!apiKey) {
    console.error("Please provide API Key");
    process.exit(1);
  }

  const urls = [
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    "https://generativelanguage.googleapis.com/v1beta/openai/v1/chat/completions"
  ];

  for (const url of urls) {
    console.log(`Testing URL: ${url}`);
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gemini-1.5-flash',
          messages: [{ role: 'user', content: 'Say hi' }]
        })
      });
      console.log(`Status: ${resp.status}`);
      if (resp.ok) {
        const data = await resp.json();
        console.log(`Success! Response: ${data.choices[0].message.content}`);
      } else {
        const text = await resp.text();
        console.log(`Error: ${text}`);
      }
    } catch (e) {
      console.log(`Fetch error: ${e.message}`);
    }
    console.log("---");
  }
}

test();
