import MetricBadge from "./MetricBadge/MetricBadge";

export default function StyleGuide() {
  return (
    <section style={{ padding: "50px" }}>
      <h1>Titles</h1>
      <hr />

      <h1>h1</h1>
      <h2>h2</h2>
      <h3>h3</h3>
      <h2>Text</h2>
      <hr />

      <p>paragraph</p>
      <h2>Buttons</h2>
      <hr />

      <button>button primary</button>
      <hr />
      <h2>Inputs</h2>
      <hr />

      <input type="text" placeholder="text input" />
      <hr />
      <h2>Components</h2>
      <p>MetricBadge:</p>
      <MetricBadge value={70} unit="Followers" />
      <MetricBadge value={70} unit="Followers" />
      <p>Some component ideas</p>
      <ul>
        {["Side Scroller", "Badge", "Nav", "TabBar", "TextField"].map((val) => (
          <li>{val}</li>
        ))}
      </ul>
    </section>
  );
}
