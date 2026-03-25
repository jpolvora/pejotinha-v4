
async function test() {
  const apiKey = process.argv[2];
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

test();
