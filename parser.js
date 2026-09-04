// 1. Define the file path or API web URL
const DATA_SOURCE_URL = "my-schema.json"; // Or "https://example.com"

async function loadAndDisplaySchemas() {
  try {
    // 2. Fetch the external JSON data
    const response = await fetch(DATA_SOURCE_URL);
    
    // Check if the network request failed (e.g., 404 or 500 errors)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 3. Parse the stream data directly into native JavaScript structures
    const schemaData = await response.json();
    
    // Normalize into an array (handles both single schema objects or lists)
    const schemasArray = Array.isArray(schemaData) ? schemaData : [schemaData];

    // 4. Loop and build the HTML variable using reduce
    const htmlOutput = schemasArray.reduce((accumulator, schema) => {
      const type = schema['@type'] || 'Unknown Type';
      const name = schema.name || schema.headline || 'Unnamed Schema';
      
      // Map out metadata fields, ignoring the root context tags
      const attributesHtml = Object.entries(schema)
        .filter(([key]) => !key.startsWith('@') && key !== 'name' && key !== 'headline')
        .map(([key, value]) => {
          // Flatten child objects (like a nested Author or Place entity) into text strings
          const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
          return `<li><strong>${key}:</strong> ${displayValue}</li>`;
        })
        .join('');

      return accumulator + `
        <div class="schema-card" style="border: 1px solid #333; padding: 15px; margin: 15px 0; font-family: system-ui;">
          <h3>Schema Type: ${type}</h3>
          <p><strong>Target Name:</strong> ${name}</p>
          <ul>
            ${attributesHtml}
          </ul>
        </div>
      `;
    }, "");

    // 5. Inject the completed string into your layout container
    document.getElementById("schema-display-panel").innerHTML = htmlOutput;

  } catch (error) {
    console.error("Could not fetch or parse JSON-LD data:", error);
    document.getElementById("schema-display-panel").innerHTML = `
      <p style="color: red;">Failed to load metadata. Please check source URL.</p>
    `;
  }
}

// Fire the function when the page script runs
loadAndDisplaySchemas();


