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
        min-width: 190px;
        max-width: 220px;
        margin-bottom: 1rem;
        border-style: solid;
        border-width: 1px;
        border-color: var(--divider-color);
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
        margin-left: 0.5rem;
        margin-right: 1rem;
        text-overflow: ellipsis;
        overflow: hidden;
        text-wrap: nowrap;
      }
      .minutes {
        margin-left: auto;
        text-wrap: nowrap;
      }
    `
  }
  
  render() {
    return html`
      <div class="badge">
        <div class="line">${this.line}</div>
        <div class="destination">${this.destination}</div>
        <div class="minutes">${this.minutes} Min.</div>
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
      :host {
        width: 100%;
      }
      .departures-overview {
        display: flex;
        flex-flow: row;
        justify-content: center;
      }
      .departure-container {
        display: flex;
        flex-flow: column;
      }
      .arrow-container {
        display: flex;
        align-items: center;
        position: relative;
        gap: 1.5rem;
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
        margin: auto 0;
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
        margin-top: 1.85rem;
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
      border-width: 3px;
      border-color: var(--primary-text-color);
      border-radius: 50%;
    }

    .dot.small::before {
        width: 20px;
        height: 20px;
    }

    .dot.large::before {
        width: 35px;
        height: 35px;
    }
    `;
  }

  render() {
    const entityId = this.config.entity;
    const state = this.hass.states[entityId];
    let departures = []
    if (state ){
      departures = state.attributes.departures;
    }

    const departuresLeft = departures.filter((departure) => this.config.directions.left.destinations.includes(departure.destination)).slice(0, 2)
    const departuresRight = departures.filter((departure) => this.config.directions.right.destinations.includes(departure.destination)).slice(0, 2)
    const unmatched = departures.filter((departure) => !this.config.directions.left.destinations.includes(departure.destination) && !this.config.directions.right.destinations.includes(departure.destination))
    return html`
    <ha-card>
      <div class="card-content">
      <div class="departures-overview">
        <div class="departure-container" style="margin-right: auto;">
          ${departuresLeft.map((departure) => {
            return html`
              <mvg-departure-badge line=${departure.line} destination=${departure.destination} minutes='${departure.time_in_mins}'/>
            `
          })}
        </div>
        <div class="departure-container">
        ${departuresRight.map((departure) => {
          return html`
            <mvg-departure-badge line=${departure.line} destination=${departure.destination} minutes='${departure.time_in_mins}'/>
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
      ${unmatched.length == 0 ? null : 
        html`
          <div>
            <h3>Derzeit nicht berücksichtigt</h3>
             ${unmatched.map((departure) => {
              return html`
                <mvg-departure-badge line=${departure.line} destination=${departure.destination} minutes='${departure.time_in_mins}'/>
              `
             }
             )}
          </div>
        `
      }
      </div>
    </ha-card>

    `
  }
}

customElements.define("mvg-departure-badge", DepartureBadge)
customElements.define("mvg-departures-card", DeparturesCard)
