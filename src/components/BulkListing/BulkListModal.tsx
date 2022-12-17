import { Dispatch, SetStateAction, useState } from "react";
import { useBulkListContext } from "../../providers/BulkListProvider";
import Button from "../Button";
import { Form } from "../Form";
import Icon from "../Icon";
import Modal from "../Modal"

interface BulkListModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
}
function BulkListModal({ open, setOpen }: BulkListModalProps): JSX.Element {
  const { listing } = useBulkListContext()
  const [globalPrice, setGlobalPrice] = useState<number>()
  const [useGlobalPrice, setUseGlobalPrice] = useState(false)

  return (
    <Modal
      title="Bulk Listing"
      open={open}
      setOpen={setOpen}
    >
      <div className="my-6 flex justify-between items-center gap-2 p-2 bg-gray-800 rounded-lg">
        <label className="inline-flex relative cursor-pointer ml-3 items-center">
          <input type="checkbox" value="" checked={useGlobalPrice} className="sr-only peer" onChange={(e) => setUseGlobalPrice(e.target.checked)}/>
          <div className="w-12 h-7 bg-black rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-200 peer-checked:after:bg-gradient-secondary  after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          <span className="ml-3 text-gray-100">Global price</span>
        </label>
        <Form.Input
          disabled={!useGlobalPrice}
          className="w-1/2"
          //saving for reference
          // error={offerFormState.errors.amount}
          // {...registerOffer('amount', { required: true })}
          // type="number"
          // min={0}
          icon={<Icon.Sol />}
          value={globalPrice}
          onChange={(e) => setGlobalPrice(parseInt(e.target.value) || undefined)}
        />
      </div>
      <hr className="w-[110%] relative -left-[5%] border-b-none border-t-[0.5px] border-gray-700/75"/>
      <div className="flex justify-between py-6">
        <div>
          Pnl
        </div>
        <div>
          0.1%
        </div>
        <div>
          Total
        </div>
      </div>
      <Button>List now</Button>

    </Modal>
  )
}

export default BulkListModal