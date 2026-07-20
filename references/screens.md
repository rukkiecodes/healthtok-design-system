# Screen Blueprints

Skeletons to build real screens from. Each gives: **scaffold → anatomy → states → JSX
sketch → telemedicine notes.**

Route paths reference the real tree in `client/healthTok-Mobilev2/app/` (121 screens,
patient and doctor roles, curved bottom tab bar).

---

## Choosing a scaffold

| If the body is… | Use | Why |
|---|---|---|
| A scrolling form or detail page | `ScreenScaffold` | Drives the collapse from its own scroll |
| A list or feed | `ListScreenScaffold` | Same, on a FlatList |
| An **inverted** chat list | `FixedHeader` | Scroll offset runs backwards; collapse would invert |
| A WebView | `FixedHeader` | The WebView owns its scroll; RN can't read it |
| Full-bleed video | `FixedHeader` or none | No scroll exists |
| A dashboard / home | Fixed greeting hero | Identity + bell must not scroll away |

---

## 1. Auth & onboarding — `app/(auth)/`

**Flow:** splash → onboarding carousel → account type → email → OTP → profile setup.

| Screen | Scaffold | Anatomy |
|---|---|---|
| Onboarding | None (full-bleed) | Paged carousel, `title1` headline + `body` `inkMuted48` copy, pill dots (`primary` active / `hairline` idle), pinned `Button fullWidth` |
| Account type | `ScreenScaffold` | Two `Card`s — Patient / Doctor. Selected → `borderWidth.thick` `primaryFocus`, icon tint `ink → primary`. Nothing else changes. |
| Email | `ScreenScaffold` | One `Input`, pinned `Button`. |
| OTP | `ScreenScaffold` | `OtpInput` (6 cells), resend countdown in `caption` `inkMuted48`, shake on error. |
| Profile setup | `ScreenScaffold` | Avatar picker, name, DOB, gender. |

```tsx
<ScreenScaffold title="Create your account" subtitle="We'll send you a 6-digit code">
  <View style={{ gap: spacing.lg }}>
    <Input label="Email" value={email} onChangeText={setEmail}
      keyboardType="email-address" autoCapitalize="none" error={error} />
    <Button label="Continue" fullWidth loading={pending} onPress={submit} />
  </View>
</ScreenScaffold>
```

**Notes:** wrap in `KeyboardAvoidingView` with `behavior="height"` on Android. The account-type
choice drives every later route — make the selected state unmistakable (border + weight, not
color alone).

---

## 2. Patient home — `app/(app)/(patient)/(tabs)/`

**Fixed greeting hero, not a collapsing title.**

Anatomy, top to bottom:
1. **Hero row** — 56pt avatar, "Good morning" `callout` `inkMuted48` + first name
   `semiBold` `title3`, `HeaderSettingsButton`, `NotificationBell`.
2. **Next appointment** — the screen's one hero card. Doctor avatar + name + specialty,
   date/time **with timezone**, status badge. When live, a `primary` Button "Join
   consultation". When none, an `EmptyState`-style prompt with a Book CTA.
3. **Quick actions** — 4 tiles: Book, Chat, Records, Prescriptions.
4. **Top doctors** — horizontal `DoctorCard` carousel + `SectionHeader` "See all".
5. **Health plan progress** — `StatTile`s.
6. **Blogs** — vertical cards.

```tsx
<ScrollView contentContainerStyle={{ paddingBottom: spacing.xxxl + TAB_BAR_CLEARANCE }}>
  <GreetingHero />
  <View style={{ paddingHorizontal: spacing.xl, gap: spacing.xl }}>
    <NextAppointmentCard appointment={next} />
    <QuickActions />
    <SectionHeader title="Top doctors" action="See all" onPress={…} />
    <DoctorCarousel doctors={top} />
  </View>
</ScrollView>
```

**Notes:** one clear primary action per screen. A patient opening this app is often anxious —
the next appointment and how to reach a doctor should be answerable in under two seconds.

---

## 3. Doctor home — `app/(app)/(doctor)/(tabs)/`

Same hero pattern. Then: today's schedule (timeline rows), pending consult requests (accept /
decline per row), earnings summary `StatTile`, quick stats (patients seen, rating, response
time).

---

## 4. Tab-root list screen

The workhorse pattern.

```tsx
<ListScreenScaffold<Doctor>
  title="Find a doctor"
  padded
  showBack={false}
  left={<HeaderSettingsButton />}
  right={<NotificationBell />}
  data={doctors}
  keyExtractor={(d) => d.id}
  contentContainerStyle={{ gap: spacing.base, flexGrow: 1 }}
  ListHeaderComponent={
    <View style={{ gap: spacing.sm }}>
      <Input leftIcon="magnifyingglass" placeholder="Search doctors" value={q} onChangeText={setQ} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.xs }}>
        {SPECIALTIES.map((s) => <FilterChip key={s} label={s} active={…} onPress={…} />)}
      </ScrollView>
    </View>
  }
  renderItem={({ item }) => <DoctorCard doctor={item} onPress={…} />}
  onEndReached={loadMore}
  onEndReachedThreshold={0.6}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={colors.primary} />}
  ListEmptyComponent={<EmptyState icon="magnifyingglass" title="No doctors found"
    body="Try a different specialty or clear your filters." />}
/>
```

Filters open via `sheet()`, never a dropdown.

---

## 5. Doctor detail

`ScreenScaffold`. Hero: 112pt avatar, name `bold` `title3` + verified seal, specialty
`callout` `inkMuted48`, `RatingStars` + review count. Then: About, Reviews carousel,
Availability strip, and a **pinned** Book CTA above the safe area.

---

## 6. Booking flow

**Step 1 — date.** Horizontal day strip; selected day is a `primaryFill` pill.
**Step 2 — slot.** A **chip grid of concrete times**, not a time wheel. Selected chip gets
`borderWidth.thick` `primaryFocus`. Disabled slots are `canvasParchment` with `inkMuted48`
text **and a reason** ("Booked") — never just gray.
**Step 3 — reason for visit.** Multiline `Input` + `SymptomChip` suggestions.
**Step 4 — review & pay.** Line items, total `semiBold` `headline`, pinned Pay CTA.

**Notes:** always render the **timezone** next to slot times. Show the consult fee before
the payment step, not at it.

---

## 7. Appointments — `(patient)/(schedule)/`, `(doctor)/(appointments)/`

`ListScreenScaffold padded`. Segmented control (Upcoming / Past) as `ListHeaderComponent`.
`AppointmentCard` rows with status badges. Cancel goes through a destructive `alert()`
naming the consequence:

```tsx
alert({
  title: 'Cancel this appointment?',
  message: 'Dr. Adeyemi will be notified. Cancelling within 2 hours may incur a fee.',
  buttons: [
    { text: 'Keep appointment', style: 'cancel' },
    { text: 'Cancel appointment', style: 'destructive', onPress: () => cancel(id) },
  ],
});
```

---

## 8. Consultation chat — `(patient)/(chats)/`, `(doctor)/(chats)/`

`FixedHeader` (inverted list). Header title = the other party's name; `right` holds a
`video` call button and an overflow `ellipsis`.

```tsx
<FixedHeader title={doctor.name} right={<CallButton onPress={startCall} />}>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + BAR_HEIGHT : 0}
    style={{ flex: 1, backgroundColor: colors.canvas }}
  >
    <ConsultTimerBanner endsAt={session.endsAt} />
    <FlatList inverted data={messages} renderItem={({ item }) => <ConsultBubble message={item} />} />
    <ChatComposer onSend={send} onAttach={pickAttachment} />
  </KeyboardAvoidingView>
</FixedHeader>
```

**States:** waiting for doctor · in progress · **ended** (composer replaced by a
`canvasParchment` bar reading "This consultation has ended" + a Book follow-up CTA).
Attachments and images get their own bubble variants.

**Notes:** attachment picking must use `motion.actionDelay` after the sheet dismisses, or
the native picker won't present.

---

## 9. Live video call — `app/(app)/(call)/[chatId]`

No collapsing header. Full-bleed `surfaceBlack`.

Anatomy: remote video fills the screen → local PiP (120×160, `radius.lg`, draggable,
top-right below the safe area) → participant name pill (`onDark60` bg) → `CallControlBar`
pinned bottom.

**States that must be designed:** connecting · reconnecting (a `warning` banner) · poor
connection (a persistent indicator) · doctor hasn't joined · **permission denied** for
camera/mic (a full-screen `EmptyState` with a Settings deep-link, not a silent black
screen) · call ended.

**Notes:** keep the screen awake. End-call is `danger` and visually distinct. Every control
is icon-only, so every control needs an `accessibilityLabel`.

---

## 10. AI symptom chat — `(patient)/(aiChat)/`

Message list + `SymptomChip` suggestions + composer.

**Required, non-negotiable:**
- A **persistent disclaimer** — pinned, not a one-time dismissible toast: *"This is general
  information, not a diagnosis."*
- A visible **escalate-to-a-real-doctor** CTA at all times.
- AI output is **never** styled like a clinical verdict — no `success`/`danger` badges on a
  suggestion, no confident status pills. Use plain body copy on `canvasParchment`.
- Any red-flag symptom triggers an immediate, unmissable prompt to seek urgent care.

---

## 11. Prescriptions — `(chats)/(prescription)/`

List: `ListScreenScaffold padded`, `PrescriptionRow`s grouped by consultation date.
Detail: `ScreenScaffold` — drug, **dose with unit**, frequency, duration, prescriber,
issue date, status badge, notes; actions to share/download the PDF.

**Notes:** doses always carry explicit units. A bare `500` is a safety defect. Show the
prescribing doctor's name and the issue date on every prescription.

---

## 12. Medical records / patient file

`ScreenScaffold`. Grouped `surfacePearl` sections separated by `dividerSoft`: Allergies ·
Conditions · Vitals (a `VitalTile` grid) · Documents · Family history.

Empty groups still render with an "Add" affordance — a missing allergy section reads as
"no allergies recorded", which is different from "no allergies", so label it precisely.

---

## 13. Setup wizard — `(patient)/(setup)/`, `(doctor)/(setup)/`

One question per screen: progress bar under the header → question `bold` `title3` →
options or input → pinned Continue → optional Skip in `ghost`.

**Note:** there is live route duplication between `(patient)/(patientSetup)/*` (old,
Paper-based) and `(patient)/(setup)/*` (new). Confirm which is routed before restyling —
see `migration.md`.

---

## 14. Profile & settings

`ScreenScaffold`. Grouped `surfacePearl` rows, `radius.lg`, `overflow: 'hidden'`, separated
by `dividerSoft` hairlines (skip row 0). Each row: icon → label → value/chevron.

**Include an Appearance row** wired to the theme:

```tsx
<SettingRow label="Appearance" value={MODE_LABEL[mode]} onPress={() =>
  sheet({
    title: 'Appearance',
    options: [
      { text: 'System', onPress: () => setMode('system') },
      { text: 'Light',  onPress: () => setMode('light') },
      { text: 'Dark',   onPress: () => setMode('dark') },
    ],
  })
} />
```

Sign out and Delete account both go through destructive `alert()`. Delete account states
what is lost and is irreversible.

---

## 15. Wallet / earnings — `(doctor)/(wallet)/`

Balance hero (`title1` amount, `callout` `inkMuted48` label), payout CTA, then a
transaction `ListScreenScaffold` with `PAYMENT_STATUS_PALETTE` badges.

---

## 16. Form-sheet screens

Router: `presentation: 'formSheet'`. Screen: `<ScreenScaffold sheet title="Filters">`.
`sheet` drops the safe-area top inset — without it the header floats down with a dead gap.

---

## 17. Universal state treatments

Every list and data screen handles all five. A spinner on a blank screen is not a state.

| State | Treatment |
|---|---|
| Loading | Skeleton rows where the shape is known; centered `ActivityIndicator` in `colors.primary` otherwise |
| Empty | `EmptyState` — icon, title, one line of guidance, a CTA |
| Error | `EmptyState` with `exclamationmark.triangle`, a plain-language message, a Retry button |
| Offline | Persistent `warning` banner under the header; cached content stays visible and is labeled as such |
| Permission denied | Full `EmptyState` explaining why the permission is needed + a deep link to Settings |

---

## 18. Bottom-tab clearance

Every screen inside a tab reserves bottom padding so its last row clears the curved bar
(patient ≈ 40, doctor ≈ 50 — see `tab-bar.md`). A pinned CTA must clear the bar **and**
`insets.bottom`.
