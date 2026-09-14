import Papa from 'papaparse';
// @ts-ignore
import DataWorker from '../workers/dataWorker?worker';

const fallbackFetchCSV = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: () => resolve(null)
      });
    });
  } catch (e) {
    console.error(`Fallback fetchCSV failed for ${url}:`, e);
    return null;
  }
};

const fallbackFetchJSON = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error(`Fallback fetchJSON failed for ${url}:`, e);
    return null;
  }
};

const fetchCSV = async (url: string) => {
  return new Promise((resolve) => {
    let handled = false;
    let timer: any = null;

    const cleanupAndFallback = (reason: string) => {
      if (!handled) {
        handled = true;
        if (timer) clearTimeout(timer);
        console.warn(`Worker fallback (${reason}) for ${url}`);
        fallbackFetchCSV(url).then(resolve);
      }
    };

    try {
      const worker = new DataWorker();
      timer = setTimeout(() => {
        try { worker.terminate(); } catch (e) {}
        cleanupAndFallback('timeout 3000ms');
      }, 3000);

      worker.onmessage = (e: any) => {
        if (!handled) {
          handled = true;
          if (timer) clearTimeout(timer);
          try { worker.terminate(); } catch (e) {}
          if (e.data.success) {
            resolve(e.data.data);
          } else {
            console.warn(`Worker error for ${url}, falling back to main thread:`, e.data.error);
            fallbackFetchCSV(url).then(resolve);
          }
        }
      };
      worker.onerror = (err: any) => {
        if (!handled) {
          handled = true;
          if (timer) clearTimeout(timer);
          try { worker.terminate(); } catch (e) {}
          console.warn(`Worker onerror for ${url}, falling back to main thread:`, err);
          fallbackFetchCSV(url).then(resolve);
        }
      };
      worker.postMessage({ type: 'fetchCSV', url });
    } catch (err) {
      cleanupAndFallback('exception');
    }
  });
};

const fetchJSON = async (url: string) => {
  return new Promise((resolve) => {
    let handled = false;
    let timer: any = null;

    const cleanupAndFallback = (reason: string) => {
      if (!handled) {
        handled = true;
        if (timer) clearTimeout(timer);
        console.warn(`Worker fallback (${reason}) for ${url}`);
        fallbackFetchJSON(url).then(resolve);
      }
    };

    try {
      const worker = new DataWorker();
      timer = setTimeout(() => {
        try { worker.terminate(); } catch (e) {}
        cleanupAndFallback('timeout 3000ms');
      }, 3000);

      worker.onmessage = (e: any) => {
        if (!handled) {
          handled = true;
          if (timer) clearTimeout(timer);
          try { worker.terminate(); } catch (e) {}
          if (e.data.success) {
            resolve(e.data.data);
          } else {
            console.warn(`Worker error for ${url}, falling back to main thread:`, e.data.error);
            fallbackFetchJSON(url).then(resolve);
          }
        }
      };
      worker.onerror = (err: any) => {
        if (!handled) {
          handled = true;
          if (timer) clearTimeout(timer);
          try { worker.terminate(); } catch (e) {}
          console.warn(`Worker onerror for ${url}, falling back to main thread:`, err);
          fallbackFetchJSON(url).then(resolve);
        }
      };
      worker.postMessage({ type: 'fetchJSON', url });
    } catch (err) {
      cleanupAndFallback('exception');
    }
  });
};

// Caching to prevent refetching
const cache: Record<string, any> = {};

export const loadLocalData = async (type: 'flights' | 'buses' | 'trains') => {
  if (cache[type]) return cache[type];

  let data = null;
  if (type === 'flights') {
    const [airports, routes] = await Promise.all([
      fetchCSV('/data/airports.csv').catch(error => { console.error("Data Load Error:", error); return null; }),
      fetchCSV('/data/routes.csv').catch(error => { console.error("Data Load Error:", error); return null; })
    ]);
    let finalRoutes: any = (routes as any) || [];
    if (!finalRoutes || finalRoutes.length === 0) {
      const cities = ['BOM', 'DEL', 'PNQ', 'ISK', 'BLR', 'HYD', 'GOI', 'NAG', 'IXU', 'SAG'];
      const airlines = ['6E', 'AI', 'UK', 'QP'];
      const times = [
        { dep: '06:00 AM', arr: '08:25 AM', dur: '2h 25m' },
        { dep: '08:30 AM', arr: '10:45 AM', dur: '2h 15m' },
        { dep: '11:15 AM', arr: '01:30 PM', dur: '2h 15m' },
        { dep: '02:45 PM', arr: '05:00 PM', dur: '2h 15m' },
        { dep: '05:30 PM', arr: '07:45 PM', dur: '2h 15m' },
        { dep: '08:15 PM', arr: '10:30 PM', dur: '2h 15m' },
        { dep: '10:00 PM', arr: '11:45 PM', dur: '1h 45m' }
      ];
      finalRoutes = [];
      let counter = 1;
      for (let i = 0; i < cities.length; i++) {
        for (let j = 0; j < cities.length; j++) {
          if (i === j) continue;
          const src = cities[i];
          const dest = cities[j];
          const airline = airlines[(i + j) % airlines.length];
          const timeInfo = times[(i * j + i + j) % times.length];
          const price = 3500 + ((i * 13 + j * 17) % 50) * 100;
          
          finalRoutes.push({
            Airline: airline,
            Route_ID: `${airline}-${100 + counter}`,
            Source_Airport: src,
            Destination_Airport: dest,
            DepTime: timeInfo.dep,
            ArrTime: timeInfo.arr,
            Duration: timeInfo.dur,
            Price: price,
            Stops: (i + j) % 5 === 0 ? '1' : '0'
          });
          counter++;
          if (finalRoutes.length === 71) break;
        }
        if (finalRoutes.length === 71) break;
      }
    }
    data = { airports, routes: finalRoutes };
  } else if (type === 'buses') {
    const buses = await fetchCSV('/data/Pan-India_Bus_Routes.csv').catch(error => { console.error("Data Load Error:", error); return null; });
    data = buses || [];
  } else if (type === 'trains') {
    const [exp, sf, pass, trains, stations, schedules] = await Promise.all([
      fetchJSON('/data/EXP-TRAINS.json').catch(error => { console.error("Data Load Error:", error); return null; }),
      fetchJSON('/data/SF-TRAINS.json').catch(error => { console.error("Data Load Error:", error); return null; }),
      fetchJSON('/data/PASS-TRAINS.json').catch(error => { console.error("Data Load Error:", error); return null; }),
      fetchJSON('/data/trains.json').catch(error => { console.error("Data Load Error:", error); return null; }),
      fetchJSON('/data/stations.json').catch(error => { console.error("Data Load Error:", error); return null; }),
      fetchCSV('/data/Schedules.csv').catch(error => { console.error("Data Load Error:", error); return null; })
    ]);
    data = { exp, sf, pass, trains, stations, schedules };
  }

  cache[type] = data;
  return data;
};
