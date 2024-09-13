import {
  css,
  LitElement,
  html,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

class DepartureBadge extends LitElement {
  static get properties() {
    return {
      line: {type: String},
      destination: {type: String},
      minutes: {type: Number},
      cancelled: {type: Boolean}
    }
  }

  static get styles() {
    return css`
      .badge {
        display: flex;
        flex-flow: row;
        border-radius: 0.5rem;
        background-color: var(--secondary-background-color);
        padding: 0.25rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        font-size: 1.0rem;
        align-items: center;
        margin-bottom: 1rem;
        border-style: solid;
        border-width: 1px;
        border-color: var(--departure-line-color);
      }
      .line {
        color: white;
        background-color: var(--departure-line-color);
        border-radius: 0.5rem;
        padding: 0.1rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        font-weight: bold;
      }
      .destination {
        margin-right: 1rem;
        text-overflow: ellipsis;
        overflow: hidden;
        text-wrap: nowrap;
      }

      .destination[cancelled] {
        text-decoration: line-through;
      }
      
      .minutes {
        margin-left: auto;
        text-wrap: nowrap;
      }
      .minutes-label {
        padding-left: 0.2rem;
        font-size: 0.75rem;
      }
    `
  }
  
  render() {
    return html`
      <div class="badge">
        <div class="destination" ?cancelled=${this.cancelled}>${this.destination}</div>
        <div class="minutes">${this.minutes}<span class="minutes-label">min</span></div>
      </div>
    `
  }
}


class DeparturesCard extends LitElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity!");
    }  
    this.config = config
    this.style.setProperty('--departure-line-color', this.config.line_color)
    this.disableWarning()
  }

  enableWarning() {
    this.warning = true;
    this.style.setProperty('--warning', null)
  }

  disableWarning() {
    this.warning = false
    this.style.setProperty('--warning', "''")
  }
  
  getCardSize() {
    return 3;
  }

  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static get styles() {
    return css`
      ha-card {
        width: 100%;
        height: 100%;
      }
      .card-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      .departures-overview {
        display: flex;
        flex-flow: row;
        justify-content: space-between;
        margin-bottom: auto;
      }
      .departure-container {
        display: flex;
        flex-flow: column;
        width: 48.5%;
      }
      .arrow-container {
        display: flex;
        align-items: center;
        position: relative;
        gap: 0.5rem;
      }

      .arrow {
        position: absolute;
        width: 100%;
        height: 10px;
        background-color: var(--departure-line-color);
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin-left: 0px;
        margin-right: 0px;
        margin-top: 0.75rem;
      }

      .arrow::before, .arrow::after {
        content: "";
        border-top: 1.25rem solid transparent;
        border-bottom: 1.25rem solid transparent;
        width: 0;
        height: 0;
        position: absolute;
        top: -0.78rem;
      }

      .arrow::before {
        border-right: 1.25rem solid var(--departure-line-color);
        left: -0.5rem;
      }

      .arrow::after {
        border-left: 1.25rem solid var(--departure-line-color);
        right: -0.5rem;
      }

      .left-group, .right-group {
        display: flex;
        gap: 10px;
        flex-grow: 1;
        flex-basis: 0;
      }

      .right-group {
        justify-content: flex-end; /* Align left group to the right */
        margin-right: auto; /* Push the center box to the center */
      }

      .left-group {
        justify-content: flex-start; /* Align right group to the left */
        margin-left: auto; /* Push the center box to the center */
      
      }
      .dot {
          display: inline-flex;
          align-items: center;
          color: var(--primary-text-color);
          flex-flow: column;
          position: relative;
          gap: 0.5rem;
          flex-grow: 1;
      }

      .dot.large {
        flex-grow: 0;
        font-weight: bold;
      }

      .dot.small {
        font-size: 0.75rem;
      }

      .dot::before {
        content: '';
        display: block;
        background-color: var(--secondary-background-color);
        border-style: solid;
        border-width: 2px;
        border-color: var(--primary-text-color);
        border-radius: 50%;
      }

      .dot.small::before {
          width: 15px;
          height: 15px;
      }

      .dot.large::before {
        content: var(--warning, '!');
        width: 25px;
        height: 25px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `;
  }

  filterDeparturesBasedOnDesinations(departures, destinations) {
    return departures.filter((departure) => destinations.includes(departure.destination))
  }

  filterDeparturesBasedOnPlatform(departures, platform) {
    return departures.filter((departure) => departure.platform == platform)
  }

  render() {
    const entityId = this.config.entity;
    const state = this.hass.states[entityId];
    let departures = []
    if (state ){
      departures = state.attributes.departures;
    }

    const departuresLeft = this.config.directions.left.destinations !== undefined ? this.filterDeparturesBasedOnDesinations(departures, this.config.directions.left.destinations) : this.filterDeparturesBasedOnPlatform(departures, this.config.directions.left.platform)
    const departuresRight = this.config.directions.right.destinations !== undefined ? this.filterDeparturesBasedOnDesinations(departures, this.config.directions.right.destinations) : this.filterDeparturesBasedOnPlatform(departures, this.config.directions.right.platform)
    const unmatched = departures.filter((departure) => !departuresLeft.includes(departure) && !departuresRight.includes(departure))
    const anyCancelled = departures.some((departure) => departure.cancelled )
    if (unmatched.length > 0 || anyCancelled) {
      if (!this.warning) {
        unmatched.length > 0 ? console.log(`There are unmatched departures for ${entityId}: ${JSON.stringify(unmatched)}`) : null
        this.enableWarning()
      }
    } else {
      if (this.warning) this.disableWarning()
    }
    return html`
    <ha-card>
      <div class="card-content">
      <div class="departures-overview">
        <div class="departure-container">
          ${departuresLeft.slice(0, 2).map((departure) => {
            return html`
              <departure-badge line=${departure.line} destination=${departure.destination} minutes='${departure.time_in_mins}' ?cancelled='${departure.cancelled}'/>
            `
          })}
        </div>
        <div class="departure-container">
        ${departuresRight.slice(0, 2).map((departure) => {
          return html`
            <departure-badge line=${departure.line} destination=${departure.destination} minutes='${departure.time_in_mins}' ?cancelled='${departure.cancelled}'/>
          `
        })}
        
        </div>
      </div>
      <div class="arrow-container">
        <div class="arrow"></div>
        <div class="left-group">
          ${this.config.directions.left.highlights.map((highlight) => {
            return html`<div class="dot small">${highlight}</div>`
          })}
        </div>
        <div class="dot large">${this.config.name}</div>
        <div class="right-group">
          ${this.config.directions.right.highlights.map((highlight) => {
            return html`<div class="dot small">${highlight}</div>`
          })}
        </div>
      </div>
      </div>
    </ha-card>

    `
  }
}

customElements.define("departure-badge", DepartureBadge)
customElements.define("mvg-departures-card", DeparturesCard)
