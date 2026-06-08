document
  .getElementById("generateBtn")
  .addEventListener("click", async function (e) {
    e.preventDefault();

    const apiKey = document.getElementById("apiKey").value.trim();
    const resumeType = document.getElementById("resumeType").value;
    const personalInfo = document.getElementById("personalInfo").value;
    const education = document.getElementById("education").value;
    const experience = document.getElementById("experience").value;
    const projects = document.getElementById("projects").value;
    const skills = document.getElementById("skills").value;
    const extracurricular =
      document.getElementById("extracurricular").value;

    if (!apiKey) {
      alert("Please enter your Gemini API key");
      return;
    }

    if (!personalInfo || !education || !experience || !skills) {
      alert(
        "Please fill Personal Information, Education, Experience and Skills"
      );
      return;
    }

    const prompt = `
Create a professional ATS-friendly ${resumeType} resume.

Use the following information:

Personal Information:
${personalInfo}

Education:
${education}

Experience:
${experience}

Projects:
${projects}

Skills:
${skills}

Extracurricular Activities:
${extracurricular}

Return ONLY clean HTML.
Do not return markdown.
Do not use \`\`\`html.
Use professional resume formatting.
`;

    document.getElementById("loading").classList.add("active");
    this.disabled = true;

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.error?.message || "Failed to generate resume"
        );
      }

      const data = await response.json();

      const resumeHTML =
        data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!resumeHTML) {
        throw new Error("No response received from Gemini");
      }

      const cleanHTML = resumeHTML
        .replace(/```html/g, "")
        .replace(/```/g, "");

      document.getElementById("resumePreview").innerHTML = cleanHTML;
    } catch (error) {
      console.error(error);

      alert(
        "Error generating resume:\n\n" +
          error.message
      );
    } finally {
      document.getElementById("loading").classList.remove("active");
      this.disabled = false;
    }
  });

document
  .getElementById("downloadBtn")
  .addEventListener("click", function () {
    window.print();
  });

document
  .getElementById("copyBtn")
  .addEventListener("click", async function () {
    const resumeContent =
      document.getElementById("resumePreview").innerHTML;

    if (
      !resumeContent ||
      resumeContent.includes("Fill out the form")
    ) {
      alert("Please generate a resume first!");
      return;
    }

    try {
      await navigator.clipboard.writeText(resumeContent);

      alert("Resume HTML copied successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to copy HTML");
    }
  });