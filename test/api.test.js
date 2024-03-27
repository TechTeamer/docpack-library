const fs = require("fs/promises")
const path = require("path")
const { describe, before, after, it } = require("mocha")
const sinon = require("sinon")
const { generate } = require("../src/index")
const getFilesModule = require("../src/services/getFiles.js")
const { addPdfModule } = require("../src/services/addPdf.js")

let chai
let expect

describe("Setup Tests", function () {
  before(async function () {
    chai = await import("chai")
    expect = chai.expect
  })

  const testConfig = {
    options: [
      {
        type: "getFiles",
        root: "./testDirectory",
        //TODO: options
      },
    ],
  }

  /**
   * Sets up the test directory with sample files and directories for testing purposes.
   * @returns {string} The path of the test directory.
   */
  async function setupTestDirectory() {
    const testDir = path.join(__dirname, "testFiles")
    // Ensure the test directory exists
    await fs.mkdir(testDir, { recursive: true })
    // Create a sample text file
    await fs.writeFile(path.join(testDir, "test.txt"), "Test content")
    // Create a .buildignore file to demonstrate ignoring specific files
    await fs.writeFile(path.join(testDir, ".buildignore"), "test.txt\nignoredDirectory/*")
    // Create a directory that should be ignored
    await fs.mkdir(path.join(testDir, "ignoredDirectory"), { recursive: true })
    // Create a file in the ignored directory to test the ignore functionality
    await fs.writeFile(path.join(testDir, "ignoredDirectory", "ignored.txt"), "Should be ignored")
    // Create Markdown and AsciiDoc files for PDF generation testing
    await fs.writeFile(path.join(testDir, "sample.md"), "# Sample Markdown\nThis is a markdown file.")
    await fs.writeFile(path.join(testDir, "sample.adoc"), "= Sample AsciiDoc\nThis is an asciidoc file.")
  
    return testDir;
  }

  /**
   * Cleans up the test directory by removing it recursively.
   *
   * @param {string} testDir - The path to the test directory.
   * @returns {Promise<void>} - A promise that resolves when the test directory is cleaned up.
   */
  async function cleanupTestDirectory(testDir) {
    await fs.rm(testDir, { recursive: true, force: true })
  }

  describe("1. getFiles Function Tests", () => {
    let testDir

    before(async () => {
      testDir = await setupTestDirectory()
    })
  
    after(async () => {
      await cleanupTestDirectory(testDir)
    })
  
    it("1.1. should ignore files specified in .buildignore", async () => {
      const files = await getFilesModule.getFiles(testDir)
      expect(files).to.be.an("array").that.does.not.include("test.txt")
      expect(files).to.be.an("array").that.does.not.include(path.join("ignoredDirectory", "ignored.txt"))
    })
  })
  
  describe("1.2 generate Function with getFiles option Tests", function () {
    let testDir
    let getFilesStub
  
    before(async () => {
      testDir = path.join(__dirname, testConfig.options[0].root)
  
      try {
        await fs.access(testDir)
      } catch (error) {
        console.warn(`\x1b[33mThe options.root directory does not exist: ${testDir}. Using an alternative directory for tests.\x1b[0m`)
        const alternativeDir = "alternativeTestDirectory"
        testDir = path.join(__dirname, alternativeDir)
        try {
          await fs.access(testDir)
        } catch {
          console.log(`Creating alternative directory: ${testDir}`)
          await fs.mkdir(testDir, { recursive: true })
        }
      }
      getFilesStub = sinon.stub(getFilesModule, "getFiles").resolves(["exampleFile.txt"])
    });

    after(async () => {
      await fs.rm(testDir, { recursive: true, force: true })
      if (getFilesStub && typeof getFilesStub.restore === "function") {
        getFilesStub.restore()
      }
    });
  
    // Test to check if getFiles option is handled correctly
    it("1.2.1 should correctly handle getFiles option", async () => {
      await generate(testConfig);
      sinon.assert.calledWith(getFilesStub, testConfig.options.find((op) => op.type === "getFiles").root)
    })
  
    // Test to ensure getFiles option returns expected result
    it("1.2.2 should return the result of getFiles option", async () => {
      const result = await generate(testConfig)
      expect(result.getFiles).to.deep.equal(["exampleFile.txt"])
    })
  })

  describe("2. addPdfModule Function Tests", function () {
    this.timeout(10000)
    
    let testDir;
    const pdfOutputDir = path.join(__dirname, "testFiles", "output")
    
    before(async function () {
      testDir = await setupTestDirectory()
    });
    
    after(async function () {
      await cleanupTestDirectory(testDir)
    });
    
    it("2.1. should generate a single PDF from md file when merge is false", async function () {
      const documentConfigMd = {
        name: "sample.pdf",
        include: true,
        files: ["sample.md"],
        path: "pdfs",
        merge: false
      }
      await addPdfModule.addPdf(documentConfigMd, testDir)
    
      const pdfPathMd = path.join(pdfOutputDir, documentConfigMd.path, documentConfigMd.name)
      let pdfExistsMd = await fs.access(pdfPathMd).then(() => true).catch(() => false)
    
      expect(pdfExistsMd).to.be.true
    });
    
    it("2.2. should generate a single PDF from adoc file when merge is false", async function () {
      const documentConfigAdoc = {
        name: "sample.pdf",
        include: true,
        files: ["sample.adoc"],
        path: "pdfs",
        merge: false
      };
      await addPdfModule.addPdf(documentConfigAdoc, testDir)
    
      const pdfPathAdoc = path.join(pdfOutputDir, documentConfigAdoc.path, documentConfigAdoc.name)
      let pdfExistsAdoc = await fs.access(pdfPathAdoc).then(() => true).catch(() => false)
    
      expect(pdfExistsAdoc).to.be.true
    });
    
    it("2.3. should generate a single PDF from multiple files (.md, .adoc) when merge is true", async function () {
      const documentConfigMerge = {
        name: "MergedDocument.pdf",
        include: true,
        files: ["sample.md", "sample.adoc"],
        path: "pdfs",
        merge: true
      }
      await addPdfModule.addPdf(documentConfigMerge, testDir)
    
      const pdfPathMerge = path.join(pdfOutputDir, documentConfigMerge.path, documentConfigMerge.name)
      let pdfExistsMerge = await fs.access(pdfPathMerge).then(() => true).catch(() => false)
    
      expect(pdfExistsMerge).to.be.true
    })
  })
})
