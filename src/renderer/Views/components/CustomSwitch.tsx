import './statics/switch.css';

type Props = {
  initialState: boolean;
  switchLabel: string;
  onFunc: Function;
};

export default function CustomSwitch({
  initialState,
  switchLabel,
  onFunc,
}: Props) {
  return (
    <div>
      <label htmlFor="animate" className="switch-label">
        {switchLabel}:
      </label>
      <label className="switch">
        <input
          onChange={(e) => {
            console.log('i got called');
            e.target.checked ? onFunc(true) : onFunc(false);
          }}
          defaultChecked={initialState}
          type="checkbox"
          id="animate"
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
}
