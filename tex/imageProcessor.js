function markdownToLatex(markdown) {
  // Regular expression to match markdown image syntax ![alt text](image path)
  const markdownImageRegex = /!\[.*\]\((.*)\)/;

  // Extract the image path using the regular expression
  const match = markdown.match(markdownImageRegex);

  if (match) {
    // Get the image path with the extension
    const imagePathWithExtension = match[1];

    // Remove the extension from the image path
    const imagePath = imagePathWithExtension.replace(/\.[^/.]+$/, "").replace(/^</, '');

    // Construct the LaTeX figure syntax
    const latexSyntax = `
\\begin{figure}
    \\centering
    \\includegraphics[width=\\linewidth]{${imagePath}}
\\end{figure}`;

    return latexSyntax;
  } else {
    // If the markdown does not match the image syntax, return an error message or empty string
    return 'Invalid markdown image syntax';
  }
}

// Example usage:
// const markdownLine = '![Lisa](images/lisa.png)';
const markdownLine = '![Screenshot from 2024-04-11 09-21-26.png](<assets/Screenshot from 2024-04-11 09-21-26.png>)';
// const markdownLine = '![The San Juan Mountains are beautiful!](/assets/images/san-juan-mountains.jpg "San Juan Mountains")';
console.log(markdownToLatex(markdownLine));
