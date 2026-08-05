cat << 'INNER_EOF' > /tmp/train_service.patch
--- src/services/trainCatalogService.ts
+++ src/services/trainCatalogService.ts
@@ -19,6 +19,7 @@
 let exactMap = new Map<string, TrainCatalogEntry>();
 let numberPartMap = new Map<string, TrainCatalogEntry>();
+let catalogArray: TrainCatalogEntry[] = [];
 let _dataLoaded = false;
 
 export async function loadTrainCatalog() {
@@ -32,6 +33,7 @@
         trainNumber: numRaw,
         trainName: String(item.trainName || '').trim(),
         accommodation: String(item.accommodation || '').trim()
       };
+      catalogArray.push(entry);
 
       exactMap.set(numRaw, entry);
@@ -48,6 +50,14 @@
   } catch (error) {
     console.error("Failed to load train catalog:", error);
   }
+}
+
+export function searchTrainCatalog(query: string): TrainCatalogEntry[] {
+  if (!query || query.length < 2) return [];
+  const q = query.toLowerCase();
+  return catalogArray.filter(entry => 
+    entry.trainName.toLowerCase().includes(q) || entry.trainNumber.includes(q)
+  ).slice(0, 50); // limit results
 }
 
 /**
INNER_EOF
cat /tmp/train_service.patch | patch -p0
