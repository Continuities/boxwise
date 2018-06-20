import React from "react";
import { connect } from "react-redux";
import AddBoxDialog, { DIALOG_NAME } from "./AddBoxDialog";
import firebase, { firestore } from "../firebase";
import { ProductsCollection } from "../queries/products";
import { handleError } from "../utils";

const DEFAULT_STATE = {
  box: null,
  done: false
};

class AddBoxDialogContainer extends React.Component {
  state = DEFAULT_STATE;

  reset = () => {
    this.setState(DEFAULT_STATE);
  };

  render() {
    const { onClose, profile, ...props } = this.props;
    if (profile.isFetching || !profile) {
      return <AddBoxDialog isLoading={true} products={[]} />;
    }

    const { organization, ref } = profile.data;

    return (
      <ProductsCollection
        organizationRef={organization.ref}
        render={({ data }) => {
          return (
            <AddBoxDialog
              isLoading={false}
              products={data}
              done={this.state.done}
              box={this.state.box}
              selectedProduct={this.state.selectedProduct}
              onSubmit={(values, { setSubmitting, setErrors }) => {
                values.organization = firestore.doc(organization.ref);
                values.product = firestore.doc("products/" + values.product);
                values.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                values.createdBy = firestore.doc(ref);
                values.humanID = Math.floor(Math.random() * 1000000);
                firestore
                  .collection("boxes")
                  .add(values)
                  .then(ref => {
                    return ref.get();
                  })
                  .then(box => {
                    setSubmitting(false);
                    this.setState({
                      box: box.data(),
                      selectedProduct: data.filter(
                        product => product.id === values.product.id
                      )[0],
                      done: true
                    });
                  })
                  .catch(e => {
                    setSubmitting(false);
                    // TODO: handle user error, throw everything else
                    handleError(e);
                  });
              }}
              onClose={() => {
                this.reset();
                onClose();
              }}
              onReset={this.reset}
              {...props}
            />
          );
        }}
      />
    );
  }
}

export default connect(state => ({
  profile: state.profile,
  open: state.dialog.openDialog === DIALOG_NAME
}))(AddBoxDialogContainer);
