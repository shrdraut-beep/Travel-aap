import Papa from 'papaparse';

self.onmessage = async (e) => {
  const { type, url } = e.data;
  
  if (type === 'fetchCSV') {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url} (status: ${res.status})`);
      if (res.headers.get('content-type')?.includes('text/html')) {
        throw new Error(`File not found, received HTML fallback for ${url}`);
      }
      const text = await res.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) { console.error("Papa parse errors:", results.errors); }
          self.postMessage({ success: true, data: results.data });
        },
        error: (err) => {
          console.error("Data Load Error: Papa Parse failed", err);
          self.postMessage({ success: false, error: err.message });
        }
      });
    } catch (err: any) {
      self.postMessage({ success: false, error: err.message });
    }
  } else if (type === 'fetchJSON') {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url} (status: ${res.status})`);
      if (res.headers.get('content-type')?.includes('text/html')) {
        throw new Error(`File not found, received HTML fallback for ${url}`);
      }
      const text = await res.text();
      const data = JSON.parse(text);
      self.postMessage({ success: true, data });
    } catch (err: any) {
      self.postMessage({ success: false, error: err.message });
    }
  }
};

