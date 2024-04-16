const { Writable } = require('stream')
const path = require("path")
const { describe, before, after, it } = require("mocha")
const axios = require('axios')
const sinon = require("sinon")
const fs = require("fs")
const puppeteer = require('puppeteer')
const fsPromises = require("fs/promises")
const JSZip = require("jszip")
const { generate } = require("../src/index")

const getFilesModule = require("../src/services/getFiles.js")
const { addPdfModule } = require("../src/services/addPdf.js")
const packFolder = require("../src/services/packFolder.js")
const { youtrack } = require('../src/services/youtrack.js')
const configPath = path.join(__dirname, './../src', 'docs.json')
const configRaw = fs.readFileSync(configPath, 'utf8')
const config = JSON.parse(configRaw)
const youtrackConfig = config.options.find(option => option.type === "youtrack")

let chai
let expect

describe("Setup Tests", function () {

  before(async function () {
    chai = await import("chai")
    expect = chai.expect
  })

  afterEach(() => {
    sinon.restore()
  })

  const testConfig = {
    options: [
      {
        type: "getFiles",
        root: "./testDirectory"
      }
    ]
  }

  /**
   * Sets up the test directory with sample files and directories for testing purposes.
   * @returns {string} The path of the test directory.
   */
  async function setupTestDirectory() {
    const testDir = path.join(__dirname, "testFiles")
    // Ensure the test directory exists
    await fsPromises.mkdir(testDir, { recursive: true })
    // Create a sample text file
    await fsPromises.writeFile(path.join(testDir, "test.txt"), "Test content")
    // Create a .buildignore file to demonstrate ignoring specific files
    await fsPromises.writeFile(path.join(testDir, ".buildignore"), "test.txt\nignoredDirectory/*")
    // Create a directory that should be ignored
    await fsPromises.mkdir(path.join(testDir, "ignoredDirectory"), { recursive: true })
    // Create a file in the ignored directory to test the ignore functionality
    await fsPromises.writeFile(path.join(testDir, "ignoredDirectory", "ignored.txt"), "Should be ignored")
    // Create Markdown and AsciiDoc files for PDF generation testing
    await fsPromises.writeFile(path.join(testDir, "sample.md"), "# Sample Markdown\nThis is a markdown file.")
    await fsPromises.writeFile(path.join(testDir, "sample.adoc"), "= Sample AsciiDoc\nThis is an asciidoc file.")
    //Create a directory for youtrack test
    await fsPromises.mkdir(path.join(testDir, "build/archives"), { recursive: true })
  
    return testDir;
  }

  /**
   * Cleans up the test directory by removing it recursively.
   *
   * @param {string} testDir - The path to the test directory.
   * @returns {Promise<void>} - A promise that resolves when the test directory is cleaned up.
   */
  async function cleanupTestDirectory(testDir) {
    await fsPromises.rm(testDir, { recursive: true, force: true })
  }

  describe("1. getFiles Function Tests", () => {
    let testDir

    before(async () => {
      testDir = await setupTestDirectory()
    })
    
    beforeEach(() => {
      getFilesStub = sinon.stub(getFilesModule, "getFiles").resolves(["exampleFile.txt"]);
    });
  
    after(async () => {
      await cleanupTestDirectory(testDir)
    })
  
    it("1.1. should ignore files specified in .buildignore", async () => {
      console.log(`testDir: ${testDir}`);
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
        await fsPromises.access(testDir)
      } catch (error) {
        console.warn(`\x1b[33mThe options.root directory does not exist: ${testDir}. Using an alternative directory for tests.\x1b[0m`)
        const alternativeDir = "alternativeTestDirectory"
        testDir = path.join(__dirname, alternativeDir)
        try {
          await fsPromises.access(testDir)
        } catch {
          console.log(`Creating alternative directory: ${testDir}`)
          await fsPromises.mkdir(testDir, { recursive: true })
        }
      }
      getFilesStub = sinon.stub(getFilesModule, "getFiles").resolves(["exampleFile.txt"])
    });

    after(async () => {
      await fsPromises.rm(testDir, { recursive: true, force: true })
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
      const result = await generate(testConfig);
      expect(result.getFiles).to.deep.equal(["exampleFile.txt"]);
    });
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
        files: ["sample.md"],
        path: "pdfs",
        merge: false
      }
      await addPdfModule.addPdf(documentConfigMd, testDir)
    
      const pdfPathMd = path.join(pdfOutputDir, documentConfigMd.path, documentConfigMd.name)
      let pdfExistsMd = await fsPromises.access(pdfPathMd).then(() => true).catch(() => false)
    
      expect(pdfExistsMd).to.be.true
    });
    
    it("2.2. should generate a single PDF from adoc file when merge is false", async function () {
      const documentConfigAdoc = {
        name: "sample.pdf",
        files: ["sample.adoc"],
        path: "pdfs",
        merge: false
      };
      await addPdfModule.addPdf(documentConfigAdoc, testDir)
    
      const pdfPathAdoc = path.join(pdfOutputDir, documentConfigAdoc.path, documentConfigAdoc.name)
      let pdfExistsAdoc = await fsPromises.access(pdfPathAdoc).then(() => true).catch(() => false)
    
      expect(pdfExistsAdoc).to.be.true
    });
    
    it("2.3. should generate a single PDF from multiple files (.md, .adoc) when merge is true", async function () {
      const documentConfigMerge = {
        name: "MergedDocument.pdf",
        files: ["sample.md", "sample.adoc"],
        path: "pdfs",
        merge: true
      }
      await addPdfModule.addPdf(documentConfigMerge, testDir)
    
      const pdfPathMerge = path.join(pdfOutputDir, documentConfigMerge.path, documentConfigMerge.name)
      let pdfExistsMerge = await fsPromises.access(pdfPathMerge).then(() => true).catch(() => false)
    
      expect(pdfExistsMerge).to.be.true
    })
  })
  describe("3. packFolder Function Tests", function() {
    let testDir = "testFiles"
    const relativeTargetZipPath = "testFiles/packed.zip";
    const targetZipPath = path.join(__dirname, relativeTargetZipPath);

    before(async () => {
        testDir = await setupTestDirectory()
    })
  
    after(async () => {
        await cleanupTestDirectory(testDir)
        // Delete the created zip file at the end of the test
        try {
            //await fsPromises.unlink(targetZipPath)
        } catch (error) {
            // Error handling if file deletion fails
            console.error("Failed to delete test zip file:", error)
        }
    })

    it("3.1 should correctly pack the test directory into a zip file and have content", async function() {
        await packFolder(testDir, relativeTargetZipPath, __dirname)

        // Check if the zip file exists
        let zipExists = await fsPromises.access(targetZipPath).then(() => true).catch(() => false)
        expect(zipExists).to.be.true

        // Check the content of the zip file
        const zipData = await fsPromises.readFile(targetZipPath)
        const zip = await JSZip.loadAsync(zipData)
        const allFilenames = Object.keys(zip.files)

        // Ensure the zip file contains files
        expect(allFilenames.length).to.be.greaterThan(0, "The zip file should contain files.")
    })
  })
  describe("4. YouTrack Function Tests", function () {
    let axiosStub, puppeteerStub, pageStub;
    const pdfOutputDir = path.join(__dirname, "testFiles", "output");

    beforeEach(() => {
      axiosStub = sinon.stub(axios, 'get').resolves({
        data: [{ id: "1", summary: "Test Issue", description: "Test Description" }]
      });

      pageStub = {
        setContent: sinon.stub().resolves(),
        pdf: sinon.stub().resolves(Buffer.from('release.pdf')),
        close: sinon.stub().resolves()
      };

      puppeteerStub = sinon.stub(puppeteer, 'launch').resolves({
        newPage: sinon.stub().resolves(pageStub),
        close: sinon.stub().resolves()
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    it("4.1 should fetch issues from YouTrack and generate a PDF", async () => {
      await youtrack(pdfOutputDir);
      sinon.assert.calledOnce(puppeteerStub)
    });
  });
})
