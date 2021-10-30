import React, { useState } from 'react';
import './app.css';
type Args = { [argname: string]: boolean };
type Operation = 'and' | 'or';

function and(arg1: boolean, arg2: boolean): boolean {
  return arg1 && arg2;
}
function or(arg1: boolean, arg2: boolean): boolean {
  return arg1 || arg2;
}
/* ...todo:
a system for defining logical operations 
(not, and, or... more if you want) that can be passed:
 - selected args by name: (X and Y)
 - constant values not dependent on args: (true and X)
 - other operations: ((X and Y) or Z) 
 */

function evaluateOperation(operation: Operation, args: Args): boolean {
  let bool = true;

  return bool;
}

function Field({
  firstLevel = false,
  args,
}: {
  firstLevel?: boolean;
  args: Args;
}) {
  const [fieldType, setFieldType] = useState('select');

  const selectField = (
    <>
      <select value={fieldType} onChange={(e) => setFieldType(e.target.value)}>
        <option value='select' disabled>
          select
        </option>
        <option value='constant'>constant</option>
        <option value='argument'>argument</option>
        <option value='and'>and</option>
        <option value='or'>or</option>
      </select>
      <button onClick={() => setFieldType('select')}>X</button>
    </>
  );
  const constantField = (
    <>
      <select
        // value={argValue.toString()}
        onChange={(e) => {}}
      >
        <option value='false'>false</option>
        <option value='true'>true</option>
      </select>
      <button onClick={() => setFieldType('select')}>X</button>
    </>
  );

  const argumentField = (
    <>
      <select
        // value={argValue.toString()}
        onChange={(e) => {}}
      >
        <option value='select' disabled>
          select
        </option>
        {Object.entries(args).map(([argName, _]) => (
          <option value='argName'>{argName}</option>
        ))}
      </select>
      <button onClick={() => setFieldType('select')}>X</button>
    </>
  );

  let field: JSX.Element = selectField;

  switch (fieldType) {
    case 'constant':
      field = constantField;
      break;
    case 'argument':
      field = argumentField;
      break;
    case 'and' || 'or':
      field = (
        <>
          {selectField}
          <OperationBuilder operation={fieldType} args={args} />
        </>
      );
      break;

    default:
      field = selectField;
      break;
  }
  return <div>{field}</div>;
}

function OperationBuilder({
  operation,
  onChange,
  args,
}: {
  operation: Operation | any;
  onChange?: (operation: Operation) => void;
  args: Args;
}): JSX.Element {
  /* ...todo: an ugly gui for creating operations */
  return (
    <div className='ml-4'>
      <Field args={args} />
      <Field args={args} />
    </div>
  );
}

export default function App() {
  const [result, setResult] = useState<boolean | null>(null);
  const [args, setArgs] = useState<Args>({ 'My Arg': false });

  function onChangeArgName(
    e: any,
    argId: number,
    argValue: boolean,
    argArray: any[][]
  ) {
    const newName = e.target.value;
    argArray[argId] = [newName, argValue];
    setArgs(
      argArray.reduce<Args>((argsObj, argArrayArg) => {
        argsObj[argArrayArg[0]] = argArrayArg[1];
        return argsObj;
      }, {})
    );
  }

  return (
    <main>
      <div className='mb-4'>
        {Object.entries(args).map(([argName, argValue], argId, argArray) => {
          return (
            <div className='flex-row'>
              <input
                value={argName}
                onChange={(e) => onChangeArgName(e, argId, argValue, argArray)}
              />
              <select
                value={argValue.toString()}
                onChange={(e) =>
                  setArgs((prevArgs) => ({
                    ...prevArgs,
                    [argName]: e.target.value === 'true' ? true : false,
                  }))
                }
              >
                <option value='false'>false</option>
                <option value='true'>true</option>
              </select>
            </div>
          );
        })}
        <button
          onClick={() => {
            setArgs((prevArgs) => ({ ...prevArgs, newarg: false }));
          }}
        >
          +add arg
        </button>
      </div>
      <div className='mb-4'>
        <Field args={args} />
      </div>
      <div>result: {result || 'undefined'}</div>
      {/* todo: use <OperationBuilder> and have an interface
      for entering arguments and seeing the result */}
    </main>
  );
}
