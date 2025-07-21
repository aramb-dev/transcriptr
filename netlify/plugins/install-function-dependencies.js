module.exports = {
  onPreBuild: async ({ utils }) => {
    console.log(
      "Installing dotenv and other dependencies for Netlify Functions...",
    );

    // Install the necessary packages for functions
    try {
      await utils.run.command("cd netlify/functions && npm init -y");
      await utils.run.command(
        "cd netlify/functions && npm install dotenv firebase node-fetch",
      );
      console.log("Successfully installed function dependencies");
    } catch (error) {
      utils.build.failBuild("Failed to install function dependencies", {
        error,
      });
    }
  },
};
