interface CoReInterface {
  condition: boolean;
  children?: JSX.Element;
}

const CoRe = (props: CoReInterface): JSX.Element | null => {
  if (props.condition) {
    return props.children as JSX.Element;
  } else {
    return null;
  }
};

export default CoRe;
