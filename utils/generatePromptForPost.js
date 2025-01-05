const prompt = (style, tone, length, shortIdea) => {
    return `
        Create a ${style} post with a ${tone} tone and a ${length} length. 
        The post should focus on the following idea: "${shortIdea}". 
        Please only provide the post content without any extra explanation or information. 
        The content should be clear, engaging, and appropriate for a social media audience.
    `;
};
module.exports = { prompt }