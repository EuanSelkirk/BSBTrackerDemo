import { useState } from "react";
import { supabase } from "../../data/supabaseClient";
import imageCompression from "browser-image-compression";

export default function CompressRouteImages() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);

  const log = (msg) => setLogs((prev) => [...prev, msg]);

  const handleCompress = async () => {
    setRunning(true);
    setLogs([]);

    const { data: files, error } = await supabase.storage
      .from("route-images")
      .list("", { limit: 1000 });

    if (error) {
      log(`❌ Failed to list files: ${error.message}`);
      setRunning(false);
      return;
    }

    for (const file of files) {
      if (!file.metadata?.mimetype?.startsWith("image/")) continue;

      const sizeMB = file.metadata.size / 1024 / 1024;
      if (sizeMB <= 1) continue;

      log(`🔍 Compressing: ${file.name} (${sizeMB.toFixed(2)} MB)`);

      const { data: downloadData, error: downloadError } =
        await supabase.storage.from("route-images").download(file.name);

      if (downloadError) {
        log(`❌ Failed to download ${file.name}`);
        continue;
      }

      const originalBlob = downloadData;
      const originalFile = new File([originalBlob], file.name, {
        type: originalBlob.type,
      });

      try {
        const compressed = await imageCompression(originalFile, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        });

        const { error: uploadError } = await supabase.storage
          .from("route-images")
          .upload(file.name, compressed, {
            contentType: compressed.type,
            upsert: true,
          });

        if (uploadError) {
          log(`❌ Failed to upload ${file.name}`);
        } else {
          log(`✅ Compressed and replaced: ${file.name}`);
        }
      } catch (err) {
        log(`❌ Compression failed for ${file.name}: ${err.message}`);
      }
    }

    log("🎉 Done!");
    setRunning(false);
  };

  const handleCompressAvatars = async () => {
    setRunning(true);
    setLogs([]);

    const { data: folders, error: listError } = await supabase.storage
      .from("avatars")
      .list("", { limit: 1000 });

    if (listError) {
      log(`❌ Failed to list folders: ${listError.message}`);
      setRunning(false);
      return;
    }

    for (const folder of folders) {
      if (!folder.name) continue;

      const { data: files, error: filesError } = await supabase.storage
        .from("avatars")
        .list(`${folder.name}/`, { limit: 100 });

      if (filesError) {
        log(`❌ Failed to list files in ${folder.name}: ${filesError.message}`);
        continue;
      }

      for (const file of files) {
        const fullPath = `${folder.name}/${file.name}`;
        if (!file.metadata?.mimetype?.startsWith("image/")) continue;

        const sizeMB = file.metadata.size / 1024 / 1024;
        if (sizeMB <= 0.8) continue;

        log(`🔍 Compressing avatar: ${fullPath} (${sizeMB.toFixed(2)} MB)`);

        const { data: downloadData, error: downloadError } =
          await supabase.storage.from("avatars").download(fullPath);

        if (downloadError) {
          log(`❌ Failed to download ${fullPath}`);
          continue;
        }

        const originalBlob = downloadData;
        const originalFile = new File([originalBlob], file.name, {
          type: originalBlob.type,
        });

        try {
          const compressed = await imageCompression(originalFile, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 800,
            useWebWorker: true,
          });

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fullPath, compressed, {
              contentType: compressed.type,
              upsert: true,
            });

          if (uploadError) {
            log(`❌ Failed to upload ${fullPath}`);
          } else {
            log(`✅ Compressed and replaced: ${fullPath}`);
          }
        } catch (err) {
          log(`❌ Compression failed for ${fullPath}: ${err.message}`);
        }
      }
    }

    log("🎉 Done compressing avatars!");
    setRunning(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Compress Images</h1>
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleCompress}
          disabled={running}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {running ? "Running..." : "Compress Routes"}
        </button>
        <button
          onClick={handleCompressAvatars}
          disabled={running}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {running ? "Running..." : "Compress Avatars"}
        </button>
      </div>
      <div className="mt-4 text-sm bg-gray-100 p-4 rounded h-96 overflow-auto font-mono">
        {logs.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
    </div>
  );
}
