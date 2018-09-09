import React, { Component } from "react";
import { observer } from "mobx-react";
import Form from "react-jsonschema-form";

import AppStore from "../../store/AppStore";
import Loader from "../../helpers/loader/Loader";
import "./AddForm.less";
import { getContract, waitTx } from '../../lib/eth';

@observer
class AddForm extends Component {
  constructor(props) {
    super(props);
    AppStore.toggleLoader.bind(AppStore);
    AppStore.toggleAddVote.bind(AppStore)
  }

  addJudgment (e, d) {
    let keysX = [];
    let keysY = [];
    e.formData.publicKeys.trim().split('\n').forEach(el => {
      let a,b;
      [a,b] = el.split(',')
      keysX.push(a.trim())
      keysY.push(b.trim())
    })

    try {
      getContract().add(
        e.formData.judgmentMatter,
        keysX,
        keysY,
        e.formData.threshold,
        (new Date() / 1000) + e.formData.deadline * 60,
        (smth, tx) => {
          AppStore.toggleLoader();
          waitTx(tx, null, () => {
            alert('success');
            AppStore.toggleLoader();
            AppStore.toggleAddVote();
            // AppStore.setVotings(votings);
          })
        }
      );
    } catch (e) {
      alert(e.message);
    }

  }

  render() {
    const schema = {
      type: "object",
      required: ["judgmentMatter", "publicKeys", "threshold", "deadline"],
      description: "For demonstration purposes everyone can add Judgement. In real life only real Judge must be able to do this",
      properties: {
        judgmentMatter: {
          type: "string",
          title: "Judgement matter",
          default: "Should we execute Jonh Smith?"
        },
        publicKeys: {
          type: "string",
          title: "Jury public key pairs (X, Y - one pair per string)",
        },
        threshold: {
          type: "integer",
          title: "Quorum to accept",
          default: 1,
          minimum: 1
        },
        deadline: {
          type: "integer",
          title: "Time to make decision (in minutes)",
        }
      }
    };

    const uiSchema =  {
      publicKeys: {
        "ui:widget": "textarea",
        "ui:options": {
          rows: 5
        },
        "ui:placeholder": "0x4faf79ffc854e56c3012a6ecd55583fdc32b7eb5, 0x4faf79ffc854e56c3012a6ecd55583fdc32b7eb5\n0x4faf79ffc854e56c3012a6ecd55583fdc32b7eb5, 0x4faf79ffc854e56c3012a6ecd55583fdc32b7eb5"
      }
    };

    return (
      <div className="add-form">
        <Form schema={schema} uiSchema={uiSchema}
          onChange={() => console.log("changed")}
          onSubmit={this.addJudgment}
          onError={() => console.log("errors")}
        >
          <div className="button-n-loader">
            <button type="submit">Submit vote</button>
            {AppStore.loader &&
              <div className="loader">
                <Loader width={50} />
                <div>Waiting for miners</div>
              </div>
            }
          </div>
        </Form>
      </div>
    );
  }
}

export default AddForm;