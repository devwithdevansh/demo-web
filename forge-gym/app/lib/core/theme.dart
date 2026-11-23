import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// FORGE brand palette. Dark, warm charcoal with a single hard red accent.
class ForgeColors {
  static const ink = Color(0xFF08090B);
  static const ink2 = Color(0xFF0E1014);
  static const panel = Color(0xFF14171D);
  static const panelHi = Color(0xFF1A1E26);
  static const line = Color(0xFF272C36);
  static const lineHi = Color(0xFF39404D);
  static const bone = Color(0xFFF2F0E9);
  static const boneDim = Color(0xFFB9BCC4);
  static const mute = Color(0xFF858C99);
  static const red = Color(0xFFE11D2E);
  static const redHi = Color(0xFFFF4050);
  static const redDeep = Color(0xFF8E0F1B);
  static const green = Color(0xFF35C07A);
  static const amber = Color(0xFFF0A63A);
  static const blue = Color(0xFF5B8DEF);
  static const violet = Color(0xFF9B7BF0);
}

class ForgeTheme {
  static ThemeData dark() {
    final base = ThemeData(brightness: Brightness.dark, useMaterial3: true);
    final body = GoogleFonts.interTextTheme(
      base.textTheme,
    ).apply(bodyColor: ForgeColors.bone, displayColor: ForgeColors.bone);

    final textTheme = body.copyWith(
      displayLarge: display(52),
      displayMedium: display(42),
      displaySmall: display(34),
      headlineLarge: display(30),
      headlineMedium: display(26),
      headlineSmall: display(22),
      titleLarge: body.titleLarge?.copyWith(fontWeight: FontWeight.w700, letterSpacing: -0.2, color: ForgeColors.bone),
      titleMedium: body.titleMedium?.copyWith(fontWeight: FontWeight.w600, color: ForgeColors.bone),
      bodyMedium: body.bodyMedium?.copyWith(color: ForgeColors.boneDim, height: 1.45),
      bodySmall: body.bodySmall?.copyWith(color: ForgeColors.mute, height: 1.4),
      labelLarge: body.labelLarge?.copyWith(fontWeight: FontWeight.w600, letterSpacing: 0.2),
    );

    return base.copyWith(
      scaffoldBackgroundColor: ForgeColors.ink,
      canvasColor: ForgeColors.ink,
      textTheme: textTheme,
      colorScheme: const ColorScheme.dark(
        primary: ForgeColors.red,
        onPrimary: Colors.white,
        secondary: ForgeColors.bone,
        onSecondary: ForgeColors.ink,
        surface: ForgeColors.ink2,
        onSurface: ForgeColors.bone,
        error: ForgeColors.redHi,
        outline: ForgeColors.line,
      ),
      dividerColor: ForgeColors.line,
      splashFactory: InkSparkle.splashFactory,
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: ForgeColors.ink2,
        hintStyle: const TextStyle(color: ForgeColors.mute, fontSize: 14),
        labelStyle: const TextStyle(color: ForgeColors.mute, fontSize: 13),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: ForgeColors.line),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: ForgeColors.line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: ForgeColors.red, width: 1.4),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: ForgeColors.redHi),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: ForgeColors.redHi),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: ForgeColors.red,
          foregroundColor: Colors.white,
          elevation: 0,
          minimumSize: const Size(0, 50),
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: ForgeColors.bone,
          minimumSize: const Size(0, 50),
          side: const BorderSide(color: ForgeColors.lineHi),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: ForgeColors.boneDim,
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: ForgeColors.panelHi,
        contentTextStyle: GoogleFonts.inter(color: ForgeColors.bone, fontSize: 13),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: ForgeColors.line),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: ForgeColors.panel,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: ForgeColors.panelHi,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: ForgeColors.line),
        ),
        textStyle: const TextStyle(color: ForgeColors.bone, fontSize: 12),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(color: ForgeColors.red),
      scrollbarTheme: ScrollbarThemeData(
        thumbColor: WidgetStatePropertyAll(ForgeColors.lineHi),
        radius: const Radius.circular(8),
        thickness: const WidgetStatePropertyAll(5),
      ),
    );
  }

  static TextStyle display(
    double size, {
    FontWeight weight = FontWeight.w700,
    Color? color,
    double letterSpacing = 0.6,
    double height = 1.0,
  }) => GoogleFonts.barlowCondensed(
    fontSize: size,
    fontWeight: weight,
    color: color ?? ForgeColors.bone,
    letterSpacing: letterSpacing,
    height: height,
  );

  static TextStyle body(
    double size, {
    FontWeight weight = FontWeight.w400,
    Color? color,
    double height = 1.45,
    double letterSpacing = 0,
  }) => GoogleFonts.inter(
    fontSize: size,
    fontWeight: weight,
    color: color ?? ForgeColors.boneDim,
    height: height,
    letterSpacing: letterSpacing,
  );

  static TextStyle mono(double size, {FontWeight weight = FontWeight.w500, Color? color, double letterSpacing = 0.8}) =>
      GoogleFonts.jetBrainsMono(
        fontSize: size,
        fontWeight: weight,
        color: color ?? ForgeColors.mute,
        letterSpacing: letterSpacing,
      );
}
