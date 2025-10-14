const About = () => {
  return (
    <div>
      <h1 className="page-title">About The Voyages of Victora</h1>
      
      <div className="page-section">
        <h2>The Story</h2>
        <p>
          "The Voyages of Victora" is an epic pirate fantasy series that follows the adventures of Captain Bartley and his diverse crew aboard the legendary ship, Victora. Set in a world of high seas adventure, mysterious islands, and ancient magic, each volume brings new challenges and discoveries.
        </p>
      </div>

      <div className="page-section">
        <h2>The Author</h2>
        <p>
          <strong>Christopher Feveck</strong> is a passionate storyteller who brings to life the thrilling world of pirates, adventure, and fantasy. With a background in creative writing and a love for seafaring tales, Christopher has created a rich universe that captures the imagination of young adults and fantasy enthusiasts alike.
        </p>
        <p>
          Connect with the author: <a href="https://chris-feveck.com" target="_blank" rel="noopener noreferrer" style={{ color: '#20c997' }}>chris-feveck.com</a>
        </p>
      </div>

      <div className="page-section">
        <h2>The World</h2>
        <p>
          The world of Victora is filled with:
        </p>
        <ul style={{ paddingLeft: '2rem', marginTop: '1rem' }}>
          <li>Mysterious islands shrouded in legend</li>
          <li>Ancient sea creatures and mythical beings</li>
          <li>Treacherous waters and hidden treasures</li>
          <li>Diverse cultures and forgotten civilizations</li>
          <li>Magic that flows through the very seas themselves</li>
        </ul>
      </div>
    </div>
  );
};

export default About;