import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

// eslint-disable-next-line import/prefer-default-export
export const i18n = new VueI18n({
  locale: 'de',
  fallbackLocale: 'de',
  messages: {
    en: {
      hello: 'Hello',
      all: 'All',
      medium: 'Medium',
      short: 'Short',
      import: 'Import',
      settings: 'Settings',
      export: 'Export',
      next: 'Next',
      new_meeting: 'Start a new meeting',
      start: 'Start',
      resume: 'Resume',
      pause: 'Pause',
      stop: 'Stop',
      close: 'Close',
      exporter_meeting_from: 'Meeting from',
      exporter_agenda: 'Agenda',
      exporter_other: 'Others',
      exporter_refresh: 'Refresh',
      exporter_refresh_warning: 'WARNING: Confidence information are lost!',
      exporter_write_email: 'Send E-Mail',
      exporter_download_pdf: 'Download PDF',
      exporter_title: 'Export Meeting',
      importer_import: 'Import',
      importer_select_file: 'Select file to import',
      importer_import_success: 'File import successful!',
      importer_import_fail: 'Could not import file',
      importer_participants: 'Attendees',
      importer_agendapoints: 'Agenda Points',
      importer_agendapoint: 'Agenda Point',
      importer_title: 'Title',
      importer_planned_time_in_minutes: 'Planned time (in minutes)',
      importer_save_selected_data: 'Save selected data',
      general: 'General',
      speaker: 'Speaker',
      agenda: 'Agenda',
      settings_timeline_sorting: 'Timeline sorting',
      settings_ASCending: 'ASCending',
      settings_DESCending: 'DESCending',
      settings_timeline_view: 'Timeline view',
      settings_timeline_view_single_line: 'Visuzalize the conversation history as a single line',
      settings_timeline_view_multiple_lines: 'Visuzalize the conversation history  with one line per speaker',
      settings_confidences_as_greyscale: 'Visualize confidences with greyscales',
      settings_highlight_keywords_with_color: 'Highlight keywords with backgroundcolor',
      settings_word_cloud_max_words: 'Maximum words rendered in the word cloud',
      settings_word_cloud_range: 'Number of utterance before and after the current utterance (for the Word Cloud)',
      settings_word_cloud_visualize_edges: 'Visualize edges of the world cloud',
      settings_random_speaker: 'Random speaker',
      settings_control_buttons_state_dependent: 'Control buttons state dependent',
      settings_num_speaker: '# Speakers',
      settings_num_agendapoints: '# Agenda Points',
      settings_warn_time: 'Warning time',
      settings_warn_time_info: 'How many minutes before the agenda point ends the warning should be displayed?',
      settings_agendapoint_title: 'Agenda Point Title',
      settings_planned_time_in_minutes: 'Planned time (in minutes)',
      settings_info_change_before_meeting: '(Can only be changed before the meeting)',
      settings_save_changes: 'Save changes',
      settings_language: 'Language',
      name: 'Name',
      email: 'E-Mail',
      avatar: 'Avatar',
      point: 'Point',
      yes: 'Yes',
      no: 'No',
      sidebar_agenda: 'Agenda',
      sidebar_wordcloud: 'Word Cloud',
      sidebar_speakerpercentages: 'Conversation shares (in %)',
      timeline_title: 'Conversation history',
      en: 'English',
      de: 'German',
    },
    de: {
      hello: 'Hallo',
      all: 'Alles',
      medium: 'Mittel',
      short: 'Kurz',
      import: 'Importieren',
      settings: 'Einstellungen',
      export: 'Exportieren',
      next: 'Weiter',
      new_meeting: 'Neues Meeting starten',
      start: 'Start',
      resume: 'Fortsetzen',
      pause: 'Pause',
      stop: 'Stop',
      close: 'Schließen',
      exporter_meeting_from: 'Meeting vom',
      exporter_agenda: 'Agenda',
      exporter_other: 'Sonstiges',
      exporter_refresh: 'Gesprächsverlauf aktualisieren',
      exporter_refresh_warning: 'ACHTUNG: Konfidenz Informationen gehen verloren!',
      exporter_write_email: 'E-Mail schreiben',
      exporter_download_pdf: 'PDF herunterladen',
      exporter_title: 'Meeting exportieren',
      importer_import: 'Import',
      importer_select_file: 'Datei zum Importieren auswählen',
      importer_import_success: 'Datei erfolgreich importiert!',
      importer_import_fail: 'Datei konnte nicht importiert werden.',
      importer_participants: 'Teilnehmer',
      importer_agendapoints: 'Agendapunkte',
      importer_agendapoint: 'Agendapunkt',
      importer_title: 'Titel',
      importer_planned_time_in_minutes: 'Geplante Zeit (in Minuten)',
      importer_save_selected_data: 'Ausgewählte Daten speichern',
      general: 'Allgemein',
      speaker: 'Sprecher',
      agenda: 'Agenda',
      settings_timeline_sorting: 'Sortierung der Zeitleiste',
      settings_ASCending: 'AUFsteigend',
      settings_DESCending: 'ABsteigend',
      settings_timeline_view: 'Zeitleiten Ansicht',
      settings_timeline_view_single_line: 'Visualisiere den Gesprächsverlauf als eine einzige Linie',
      settings_timeline_view_multiple_lines: 'Visualisiere den Gesprächsverlauf mit einer Linie pro Sprecher',
      settings_confidences_as_greyscale: 'Visualisiere die Konfidenzen mit Graustufen',
      settings_highlight_keywords_with_color: 'Hebe Schlüsselwörter mit einer Hintergrundfarbe hervor',
      settings_word_cloud_max_words: 'Maximale Wörter in der Wort Wolke',
      settings_word_cloud_range: 'Anzahl Aussagen vor und nach aktueller Aussage für Word Cloud',
      settings_word_cloud_visualize_edges: 'Anzahl Aussagen vor und nach aktueller Aussage für Word Cloud',
      settings_random_speaker: 'Zufälliger Sprecher',
      settings_control_buttons_state_dependent: 'Kontroll-Buttons Status-abhängig',
      settings_num_speaker: '# Sprecher',
      settings_num_agendapoints: '# Agendapunkte',
      settings_warn_time: 'Warn Zeit',
      settings_warn_time_info: 'Wie viele Minuten vor Ende eines Agendapunkts soll gewarnt werden?',
      settings_agendapoint_title: 'Agendapunkt Titel',
      settings_planned_time_in_minutes: 'Geplante Zeit (in Minuten)',
      settings_info_change_before_meeting: '(Kann nur vor dem Meeting geändert werden)',
      settings_save_changes: 'Änderungen speichern',
      settings_language: 'Sprache',
      name: 'Name',
      email: 'E-Mail',
      avatar: 'Avatar',
      point: 'Punkt',
      yes: 'Ja',
      no: 'Nein',
      sidebar_agenda: 'Agenda',
      sidebar_wordcloud: 'Wort Wolke',
      sidebar_speakerpercentages: 'Redeanteile (in %)',
      timeline_title: 'Gesprächsverlauf',
      en: 'Englisch',
      de: 'Deutsch',
    },
  },
});
