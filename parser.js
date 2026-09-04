// 1. Grab all JSON-LD script blocks from the document DOM
const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');

// 2. Loop through all found scripts and accumulate the results into a single variable
const htmlOutput = Array.from(jsonLdScripts).reduce((accumulator, scriptTag) => {
  try {
    // Parse the textual JSON inside the script tag into a usable JS object
    const schemaData = JSON.parse(scriptTag.textContent);
    
    // JSON-LD can be a single object or an array of objects. Normalize into an array.
    const schemasArray = Array.isArray(schemaData) ? schemaData : [schemaData];

    // Loop through the schemas extracted from this specific script block
    const scriptBlockHtml = schemasArray.map(schema => {
      // Safely extract core JSON-LD metadata fields (with fallback text)
      const type = schema['@type'] || 'Unknown Type';
      const name = schema.name || schema.headline || 'Unnamed Schema';
      
      // Filter out meta tags like @context/@type to loop over structural attributes
      const attributesHtml = Object.entries(schema)
        .filter(([key]) => !key.startsWith('@') && key !== 'name' && key !== 'headline')
        .map(([key, value]) => {
          // If the property value is a nested object, convert it to a readable string
          const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
          return `<li><strong>${key}:</strong> ${displayValue}</li>`;
        })
        .join('');

      // Build out the dynamic HTML template structure
      return `
        <div class="schema-card" style="border: 1px solid #1a1a1a; padding: 15px; margin: 15px 0; font-family: sans-serif;">
          <h3>Schema Type: ${type}</h3>
          <p><strong>Target Name:</strong> ${name}</p>
          <ul>
            ${attributesHtml}
          </ul>
        </div>
      `;
    }).join('');

    return accumulator + scriptBlockHtml;
  } catch (error) {
    console.error("Failed to parse a JSON-LD script block:", error);
    return accumulator; // Skip corrupted blocks without breaking the loop
  }
}, ""); // Initializing the accumulator variable as an empty string

// 3. Inject the final populated variable directly into your webpage DOM container
document.getElementById("schema-display-panel").innerHTML = htmlOutput;
