# Anti-Reverse Engineering & ProGuard / R8 Obfuscation Rules for RouTripO

# 1. Code Obfuscation & Bytecode Optimization
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose
-allowaccessmodification

# 2. Obfuscate and hide source info
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# 3. Preserve Capacitor & JavaScript Interface Bridges
-keep class com.getcapacitor.** { *; }
-keep class * implements com.getcapacitor.Plugin { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 4. Preserve Firebase SDKs & Google Play Integrity / App Check
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-keep class com.google.android.play.core.integrity.** { *; }

# 5. Native methods & JNI bindings
-keepclasseswithmembernames class * {
    native <methods>;
}

# 6. Keep Serializable & Parcelable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}
