import YtdlpWrap from "yt-dlp-wrap";
import path from "path";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";

const binaryPath = path.join(process.cwd(), "bin", "yt-dlp.exe");
const url = "https://www.youtube.com/watch?v=lZPUR8iaBxI";
const format = "mp3";

console.log("Binary Path:", binaryPath);
console.log("FFmpeg Path:", ffmpegPath);

const run = async () => {
    if (!fs.existsSync(binaryPath)) {
        console.log("Downloading yt-dlp binary...");
        await YtdlpWrap.downloadFromGithub(binaryPath);
    }

    const yt = new YtdlpWrap(binaryPath);
    let args = [url, "-o", "-"];

    if (ffmpegPath) {
        args.push("--ffmpeg-location", ffmpegPath);
    }

    if (format === "mp3") {
        args.push("-x", "--audio-format", "mp3");
    } else {
        args.push("-f", "bestaudio");
    }

    console.log("Running with args:", args);

    const stream = yt.execStream(args);
    const writeStream = fs.createWriteStream("test_output.mp3");

    stream.pipe(writeStream);

    stream.on("error", (err) => {
        console.error("Stream Error:", err);
    });

    writeStream.on("finish", () => {
        console.log("Download finished");
    });

    writeStream.on("error", (err) => {
        console.error("Write Stream Error:", err);
    });
};

run().catch(console.error);
