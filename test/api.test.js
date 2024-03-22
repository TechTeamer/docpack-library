const fs = require("fs/promises");
const path = require("path");
const { describe, before, after, it } = require("mocha");
const sinon = require("sinon");
const { generate } = require("../src/index");
const getFilesModule = require("../src/services/getFiles.js");

let chai;
let expect;

describe("Setup Tests", function () {
  before(async function () {
    // Dinamikusan importáljuk a chai csomagot
    chai = await import("chai");
    expect = chai.expect;
  });

  const testConfig = {
    operations: [
      {
        type: "getFiles",
        root: "./testDirectory",
      },
    ],
  };

  async function setupTestDirectory() {
    const testDir = path.join(__dirname, "testFiles");
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(path.join(testDir, "test.txt"), "Test content");
    await fs.writeFile(path.join(testDir, ".buildignore"), "test.txt\nignoredDirectory/*");
    await fs.mkdir(path.join(testDir, "ignoredDirectory"), { recursive: true });
    await fs.writeFile(path.join(testDir, "ignoredDirectory", "ignored.txt"), "Should be ignored");
    return testDir;
  }

  async function cleanupTestDirectory(testDir) {
    await fs.rm(testDir, { recursive: true, force: true });
  }

  describe("1. getFiles Function Tests", () => {
    let testDir;

    before(async () => {
      testDir = await setupTestDirectory();
    });

    after(async () => {
      await cleanupTestDirectory(testDir);
    });

    it("1.1. should ignore files specified in .buildignore", async () => {
      const files = await getFilesModule.getFiles(testDir);
      expect(files).to.be.an("array").that.does.not.include("test.txt");
      expect(files).to.be.an("array").that.does.not.include(path.join("ignoredDirectory", "ignored.txt"));
    });
  });

  describe("2. generate Function with getFiles Operation Tests", function () {
    let testDir;
    let getFilesStub;

    before(async () => {
      testDir = path.join(__dirname, testConfig.operations[0].root);

      try {
        await fs.access(testDir);
      } catch (error) {
        console.warn(`\x1b[33mThe operations.root directory does not exist: ${testDir}. Using an alternative directory for tests.\x1b[0m`);
        const alternativeDir = "alternativeTestDirectory";
        testDir = path.join(__dirname, alternativeDir);
        try {
          await fs.access(testDir);
        } catch {
          console.log(`\x1b[33mCreating alternative directory: ${testDir}\x1b[0m`);
          await fs.mkdir(testDir, { recursive: true });
        }
      }
      getFilesStub = sinon.stub(getFilesModule, "getFiles").resolves(["exampleFile.txt"]);
    });

    after(async () => {
      await fs.rm(testDir, { recursive: true, force: true });
      if (getFilesStub && typeof getFilesStub.restore === "function") {
        getFilesStub.restore();
      }
    });

    it("2.1. should correctly handle getFiles operation", async () => {
      await generate(testConfig);
      sinon.assert.calledWith(getFilesStub, testConfig.operations.find((op) => op.type === "getFiles").root);
    });

    it("2.2. should return the result of getFiles operation", async () => {
      const result = await generate(testConfig);
      expect(result.getFiles).to.deep.equal(["exampleFile.txt"]);
    });
  });
});
