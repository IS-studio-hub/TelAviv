function pick(list, weekKey, offset = 0) {
  const seed = weekKey.split('-').reduce((sum, part) => sum + Number(part), 0) + offset;
  return list[Math.abs(seed) % list.length];
}

function pickMany(list, weekKey, count) {
  const start = Math.abs(weekKey.split('-').reduce((sum, part) => sum + Number(part), 0)) % list.length;
  return Array.from({ length: count }, (_, i) => list[(start + i) % list.length]);
}

function dayOf(week, weekday) {
  return week.days.find((d) => d.weekday === weekday);
}

function holidayNote(ctx) {
  if (!ctx.holidays?.length) return '';
  const names = [...new Set(ctx.holidays.map((h) => h.title))].join(', ');
  return names;
}

const ROOFS = [
  { name: 'Hive rooftop', place: 'Rothschild 33', blurb: 'The big roof on the boulevard — DJs, a packed terrace, and the city underneath.' },
  { name: 'The Norman rooftop', place: 'Nachalat Binyamin', blurb: 'Hotel roof, cocktails, looking over the White City.' },
  { name: 'Hilton Bayz rooftop', place: 'Hayarkon', blurb: 'Sea-facing roof. Sunset first, bass later.' },
  { name: 'The Setai roof', place: 'HaYarkon 16', blurb: 'Quiet luxury above the beach. Book a table, do not wander in.' },
  { name: 'Alma Hotel roof', place: 'Yavne / Rothschild', blurb: 'Small roof, good drinks, the old north in the background.' },
  { name: '12% Lounge', place: 'Lilienblum', blurb: 'Speakeasy energy on a terrace. Late, loud, very Tel Aviv.' },
  { name: 'Cinema Hotel roof', place: 'Dizengoff Circle', blurb: 'Right on the circle. Sunset over the Bauhaus bowls.' },
  { name: 'Brown TLV roof', place: 'Dizengoff', blurb: 'Hotel terrace, Aperol, people watching the street you just walked.' },
];

const RESTAURANTS = [
  { name: 'Nini Hachi', tag: '4.6 audience · Japanese', blurb: 'Tzomel. Travellers’ Choice sushi room. Book this week, do not walk in.' },
  { name: 'Taizu', tag: 'Asia Terranean', blurb: 'Begin 23. The sharing-menu room the city has not gotten over. Weeks ahead.' },
  { name: 'George & John', tag: '4.4 · 1,300+ Google reviews', blurb: 'Creative Israeli, small room. High review volume, no tasting-menu tax.' },
  { name: 'OCD TLV', tag: 'Chef’s table', blurb: 'Raz Rahav. 19 seats, blind tasting. The special-night pick if you can get in.' },
  { name: 'Milgo & Milbar', tag: '4.4 · seafood', blurb: 'Kerem HaTeimanim. Daily fish, loud room, 18:00 till last guest.' },
  { name: 'Shila', tag: 'Fish & grill', blurb: 'Ibn Gabirol. The seafood grill people argue about in group chats.' },
  { name: 'North Abraxas', tag: 'Fire · sharing', blurb: 'Lilienblum. Smoke, mezze, a full table. Still a city favourite.' },
  { name: 'Pastel', tag: 'Park · all day', blurb: 'Sarona / the park. Brunch through dinner. Easy to book relative to the rest.' },
  { name: 'Claro', tag: 'Market cooking', blurb: 'HaHashmonaim. Vegetables, fire, a room that still feels like Tel Aviv.' },
  { name: 'Manta Ray', tag: 'Beach · breakfast', blurb: 'On the sand. Eggs and fish with the sea. This week’s morning table.' },
];

const TRASH = [
  {
    kind: 'TikTok',
    title: 'The Dizengoff story that would not die',
    who: 'A waiter → the table → 400k viewers',
    blurb: 'Someone filmed a couple fighting over the bill outside a Rothschild wine bar. She said he always “forgets” his card. He said she always “forgets” she invited her friends. The comments picked a side by Tuesday.',
  },
  {
    kind: 'Instagram',
    title: 'Who unfollowed who after the roof',
    who: 'A DJ → a promoter, 02:14',
    blurb: 'Hive afterparty. He posted a story: “don’t book me if you don’t pay me.” She replied on her close friends: “don’t no-show and then ask for cash.” By morning both stories were gone. The screenshot is not.',
  },
  {
    kind: 'Article',
    title: 'Peni ran the hotel elevator clip',
    who: 'Gossip desk → a TV host, Friday',
    blurb: 'A clip from a seafront hotel: two familiar faces, one floor too high, one sentence too loud. The column did not name the room. The city already knew the floor.',
  },
  {
    kind: 'Reel',
    title: '“Don’t sit with them” — Gordon beach',
    who: 'A fitness creator → an actress',
    blurb: 'She filmed sunrise abs, then panned to a towel two metres away. No name. The caption: “some people do pilates, some people do press.” The actress stitched it with “some people need a hobby.”',
  },
  {
    kind: 'X',
    title: 'The chef clapped back at 08:03',
    who: 'A food account → a kitchen on Begin',
    blurb: 'Review: “overrated, cold fish, waiters on their phones.” The restaurant quote-tweeted a ticket from Saturday: the same handle, the same table, a 40% no-show. Then they muted the thread.',
  },
  {
    kind: 'TikTok',
    title: 'Namal parking as a personality test',
    who: 'A port creator → every driver in the comments',
    blurb: 'He asked why Tel Aviv men parallel park like they are in a music video. 1.2M views. Half the comments are women tagging boyfriends. The other half is the boyfriends explaining the curb.',
  },
  {
    kind: 'Story',
    title: 'She said it on close friends, not to him',
    who: 'An influencer → an actor, Wednesday night',
    blurb: 'Florentin rooftop. She posted 14 seconds: “if you bring her you don’t bring me.” He was still in the frame pouring wine. He found out from a group chat, not from her.',
  },
  {
    kind: 'Reel',
    title: 'The guest list that leaked',
    who: 'A publicist → a singer',
    blurb: 'Private dinner, 19 seats, no phones. Someone still posted the menu and three first names. The singer’s manager called it “a small room.” The city called it a seating chart.',
  },
  {
    kind: 'TikTok',
    title: 'Shabbat in Florentin, phones out',
    who: 'A visitor → the neighbours',
    blurb: 'They filmed a silent street at 18:40 and asked if the city was “broken.” Locals stitched it: the city is not broken, it is Friday. The original is still up. The stitches are funnier.',
  },
  {
    kind: 'Article',
    title: 'Who sat where at the holiday table',
    who: 'A weekend magazine → two presenters',
    blurb: 'Rosh Hashana seating as sport. One host was not at the family table they always post. Another was, with a plus-one the caption refused to name. The why is the whole piece.',
  },
  {
    kind: 'Instagram',
    title: 'The “just a friend” in the booth',
    who: 'A footballer → a model, Sunday brunch',
    blurb: 'Manta Ray, 11:20. His story was the sea. Hers was the back of his neck. By noon both archives were clean. The other tables had already taken the photo.',
  },
  {
    kind: 'TikTok',
    title: 'Allenby at 03:00, no context',
    who: 'A nightlife account → a minister’s kid',
    blurb: 'Blurry reel, loud audio, one very recognisable jacket. They asked “who is this.” The comments answered in under four minutes. He said he was “just walking.” The clip is 19 seconds of not walking.',
  },
];

export const hotspotCopy = {
  roof: 'Roof parties this week',
  bike: 'How to move around',
  door: 'Where to eat this week',
  car: 'Parking this week',
  dumpster: 'This week’s trash',
};

export function buildViews(ctx) {
  const week = ctx.week;
  const label = week.label;
  const fri = dayOf(week, 'Fri');
  const sat = dayOf(week, 'Sat');
  const thu = dayOf(week, 'Thu');
  const holidays = holidayNote(ctx);
  const kippur = ctx.yomKippur;
  const closedLine = kippur
    ? `${kippur.title} falls this week — kitchens, rails, and roofs go dark.`
    : holidays
      ? `Also this week: ${holidays}.`
      : 'No major closures on the calendar. Still check Friday afternoon.';

  const roofA = pick(ROOFS, week.key, 0);
  const roofB = pick(ROOFS, week.key, 2);
  const roofC = pick(ROOFS, week.key, 4);
  const roofD = pick(ROOFS, week.key, 6);
  const tables = pickMany(RESTAURANTS, week.key, 5);
  const tea = pickMany(TRASH, week.key, 6);
  const teaDays = [thu, fri, sat, week.days[1], week.days[2], week.days[0]].map((d) => d ?? week.days[0]);

  return {
    street: {
      kicker: 'Dizengoff St.',
      title: 'Tel Aviv',
    },
    roof: {
      kicker: `Roof parties · ${label}`,
      title: 'This week on the roofs',
      html: `
        <p class="lede">Listings for ${label} only. ${closedLine}</p>
        <div class="cards">
          <article class="card">
            <p class="card-tag">${fri ? `${fri.weekday} ${fri.label}` : 'Friday'} · sunset</p>
            <h3>${roofA.name}</h3>
            <p>${roofA.place}. ${roofA.blurb}</p>
          </article>
          <article class="card">
            <p class="card-tag">${sat ? `${sat.weekday} ${sat.label}` : 'Saturday'} · 17:00</p>
            <h3>${roofB.name}</h3>
            <p>${roofB.place}. ${roofB.blurb}</p>
          </article>
          <article class="card">
            <p class="card-tag">${thu ? `${thu.weekday} ${thu.label}` : 'Thursday'} · 21:00</p>
            <h3>${roofC.name}</h3>
            <p>${roofC.place}. ${roofC.blurb}</p>
          </article>
          <article class="card">
            <p class="card-tag">Sun–Thu this week</p>
            <h3>${roofD.name}</h3>
            <p>${roofD.place}. The standing midweek roof. ${roofD.blurb}</p>
          </article>
          ${
            kippur
              ? `<article class="card">
            <p class="card-tag">Closed</p>
            <h3>${kippur.title}</h3>
            <p>No parties. The roofs go dark with the rest of the city.</p>
          </article>`
              : ''
          }
        </div>
        <p class="fine">Refreshes every Sunday in Tel Aviv. Times shift — check the door before you climb.</p>
      `,
    },
    bike: {
      kicker: `Getting around · ${label}`,
      title: 'Public transport this week',
      html: `
        <p class="lede">Bus, light rail, train, bikes, and scooters for ${label}. ${closedLine}</p>
        <div class="cards">
          <article class="card">
            <p class="card-tag">Light rail</p>
            <h3>Dankal Red Line</h3>
            <p>Bat Yam ↔ Petah Tikva. 34 stations, ₪8 for most city hops. Allenby, Elifelet, Arlozorov. Sun–Thu ~05:00–midnight. Stops Friday afternoon${ctx.candles ? ` (candles ${new Date(ctx.candles.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' })})` : ''}, back Saturday night. No service on Shabbat${kippur ? ` or ${kippur.title}` : ''}.</p>
          </article>
          <article class="card">
            <p class="card-tag">Bus</p>
            <h3>Dan · Kavim · night lines</h3>
            <p>Rav-Kav or HopOn. Moovit for live routes. Night buses skip Shabbat${kippur ? ` and ${kippur.title}` : ''}.</p>
          </article>
          <article class="card">
            <p class="card-tag">Train</p>
            <h3>Israel Railways</h3>
            <p>Savidor / Center, HaShalom, HaHagana, University. Airport by train, not the Red Line. Last trains Friday afternoon.</p>
          </article>
          <article class="card">
            <p class="card-tag">Bicycle</p>
            <h3>Your bike + city lanes</h3>
            <p>Tel-O-Fun is gone. 3,000+ municipal hoops. Stay in the lanes. No phones while riding.</p>
          </article>
          <article class="card">
            <p class="card-tag">Scooters</p>
            <h3>Lime · Bird · Dott</h3>
            <p>App unlock, park in marked bays. They still run when the buses stop for Shabbat. They vanish on ${kippur ? kippur.title : 'major fast days'}.</p>
          </article>
        </div>
        <p class="fine">Week of ${label}. Apps: Moovit, Rav-Kav Online, HopOn.</p>
      `,
    },
    door: {
      kicker: `Tables · ${label}`,
      title: '5 restaurants the city is booking',
      html: `
        <p class="lede">Five rooms the audience is ranking this week. ${closedLine}</p>
        <div class="cards">
          ${tables
            .map(
              (place, i) => `
          <article class="card">
            <p class="card-tag">${i + 1} · ${place.tag}</p>
            <h3>${place.name}</h3>
            <p>${place.blurb}</p>
          </article>`
            )
            .join('')}
        </div>
        <p class="fine">Audience picks rotate every Sunday for ${label}.</p>
      `,
    },
    car: {
      kicker: `Parking · ${label}`,
      title: 'Where to leave the car',
      html: `
        <p class="lede">Free first. Then the lots. The metal sign on the corner is the law.</p>
        <div class="cards">
          <article class="card">
            <p class="card-tag">Free · ${sat ? sat.label : 'Saturday'}</p>
            <h3>Blue-white, all day Saturday</h3>
            <p>On-street blue-and-white is free on Shabbat this week. Still obey red curbs and resident-only plates.</p>
          </article>
          ${
            kippur
              ? `<article class="card">
            <p class="card-tag">Free · ${kippur.title}</p>
            <h3>The city stops</h3>
            <p>Do not drive. If the car is already here, it can sit.</p>
          </article>`
              : ''
          }
          <article class="card">
            <p class="card-tag">Free · evenings</p>
            <h3>After the meters sleep</h3>
            <p>Sun–Thu paid hours are roughly 08:00–19:00. Friday usually ends early afternoon. Read the sign — some streets stay resident-only overnight.</p>
          </article>
          <article class="card">
            <p class="card-tag">Free · residents</p>
            <h3>Tav (resident sticker)</h3>
            <p>In your zone, blue-white is free. Non-residents pay during the day and are often banned overnight.</p>
          </article>
          <article class="card">
            <p class="card-tag">Paid · when free is gone</p>
            <h3>Achuzot HaHof lots</h3>
            <p>Reading, Namal, Dizengoff Center, Golda. Pango or the machine. Residents with a Tav get 50–75% off most of these garages.</p>
          </article>
        </div>
        <p class="fine">Rules for ${label}. Pay with Pango.</p>
      `,
    },
    dumpster: {
      kicker: `Trash · ${label}`,
      title: 'What the city is whispering',
      html: `
        <p class="lede">Who said what to who, when, and why — for ${label} only. Posts, reels, TikToks, stories, columns. ${closedLine}</p>
        <div class="cards">
          ${tea
            .map(
              (item, i) => `
          <article class="card">
            <p class="card-tag">${item.kind} · ${teaDays[i] ? `${teaDays[i].weekday} ${teaDays[i].label}` : 'this week'}</p>
            <h3>${item.title}</h3>
            <p><strong>${item.who}</strong>. ${item.blurb}</p>
          </article>`
            )
            .join('')}
        </div>
        <p class="fine">Street tea for ${label}. Rotates every Sunday. Not a news desk — the dumpster does not fact-check.</p>
      `,
    },
  };
}
