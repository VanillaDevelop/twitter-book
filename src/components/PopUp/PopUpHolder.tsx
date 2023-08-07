import { PopUpType } from '@/types';
import PopUp from './PopUp';

export default function PopUpHolder(props: {popUps: PopUpType[], destroyPopUp: (id: string) => void}) 
{
  const elems = props.popUps.map((popUp, index) => {
    return <PopUp key={popUp.id} title={popUp.title} text={popUp.text} offset={index} destroyPopUp={() => props.destroyPopUp(popUp.id)}/>
  });

  return (
    <>
      {elems}
    </>
  );
}