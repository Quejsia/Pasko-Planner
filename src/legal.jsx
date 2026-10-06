import {go} from './lib'
const CONTACT='ILAGAY-DITO-ANG-EMAIL-MO@example.com'
const UPDATED='Oktubre 6, 2026'
const H=({children})=><h3 className="text-xl font-extrabold pt-2">{children}</h3>
const Page=({title,children})=><div className="card space-y-3 text-[15px] leading-relaxed">
 <h2 className="text-2xl font-extrabold">{title} 🎄</h2><p className="text-sm opacity-70">Huling update: {UPDATED}</p>{children}
 <button className="btn bg-gold text-red-deep w-full" onClick={()=>go('')}>Balik sa Pasko Planner</button></div>
export function Privacy(){return <Page title="Privacy Policy">
 <p>Ang Pasko Planner ay libreng monito-monita organizer. Ipinapaliwanag dito kung anong data ang kinokolekta namin at paano ito ginagamit.</p>
 <H>Ano ang kinokolekta</H>
 <ul className="list-disc pl-5 space-y-1">
  <li><b>Account:</b> email at password (o Google account) para sa login, sa pamamagitan ng Supabase Auth. Hindi namin nakikita ang password mo.</li>
  <li><b>Group:</b> pangalan ng group, budget, petsa ng party, at listahan ng mga hindi pwedeng magka-draw.</li>
  <li><b>Member:</b> ang pangalang inilagay mo sa group at hanggang 3 wishlist item.</li>
  <li><b>Draw:</b> kung sino ang nabunot ng bawat member.</li>
  <li><b>Chat:</b> ang mga anonymous na mensahe (hanggang 500 characters) sa pagitan ng giver at receiver.</li>
  <li><b>Sa device mo:</b> maliliit na setting at session data sa browser (localStorage) para manatili kang naka-login.</li>
 </ul>
 <H>Paano ginagamit</H>
 <p>Para lang patakbuhin ang app: mag-login, gumawa at sumali sa group, mag-draw, at magpakita ng reveal at chat. Hindi namin ibinebenta ang data mo at walang ads o tracking.</p>
 <H>Sino ang nakakakita</H>
 <ul className="list-disc pl-5 space-y-1">
  <li>Ang mga kasama mo sa group ay nakakakita ng pangalan mo at ng detalye ng group.</li>
  <li>Ang draw ay ginagawa sa server. Ikaw lang ang nakakakita ng nabunot mo, kahit ang organizer ay hindi.</li>
  <li>Ang chat ay anonymous para sa kausap mo. Pero nakaimbak ang mga mensahe sa database ng app, kaya ang may-ari ng app ay teknikal na may access dito. Hindi ito binabasa o ibinabahagi sa iba. Huwag pa ring magpadala ng sensitibong impormasyon.</li>
 </ul>
 <H>Mga serbisyong ginagamit</H>
 <p>Supabase (login, database, server functions), Google (opsyonal na login at Google Fonts para sa mga letra). May sarili silang privacy policy.</p>
 <H>Pagtatago at pagbura</H>
 <p>Itatago ang data habang may account at group ka. Para burahin ang account at data mo, mag-email sa <b>{CONTACT}</b>. Kapag nabura ang group, nabubura rin ang mga member, draw, at mensahe nito.</p>
 <H>Mga bata</H>
 <p>Hindi para sa mga batang wala pang 13 taong gulang ang app. Kung magulang ka at may nakitang account ng anak mo, mag-email sa amin.</p>
 <H>Mga karapatan mo</H>
 <p>May karapatan kang malaman, itama, at ipabura ang personal data mo, ayon sa Data Privacy Act of 2012 (RA 10173) ng Pilipinas. Mag-email sa <b>{CONTACT}</b>.</p>
 <H>Mga pagbabago</H>
 <p>Kapag nagbago ang policy na ito, ia-update ang petsa sa itaas.</p>
 <p><a className="underline font-bold" href="#/terms">Basahin ang Terms of Use</a></p></Page>}
export function Terms(){return <Page title="Terms of Use">
 <p>Sa paggamit ng Pasko Planner, sumasang-ayon ka sa mga ito. Kung hindi, huwag munang gamitin ang app.</p>
 <H>Ang serbisyo</H>
 <p>Libreng tool ito para mag-organize ng monito-monita sa pamilya at barkada. Ibinibigay ito nang "as is", walang garantiya na laging gagana, walang error, o hindi mawawala ang data.</p>
 <H>Account mo</H>
 <ul className="list-disc pl-5 space-y-1">
  <li>Ikaw ang may-ari ng account mo at responsable sa seguridad nito.</li>
  <li>Magbigay ng totoong email at huwag gumamit ng account ng iba.</li>
 </ul>
 <H>Tamang paggamit</H>
 <p>Bawal ang pambu-bully, panliligalig, spam, pagbabanta, ilegal na content, o pagtatangkang hanapin kung sino ang nagpadala ng anonymous na mensahe. Bawal ding sirain o i-hack ang app at ang mga server nito.</p>
 <H>Content mo</H>
 <p>Ikaw ang may-ari ng mga inilagay mo (pangalan, wishlist, mensahe). Binibigyan mo kami ng pahintulot na itago at ipakita ito sa mga kasama mo sa group para gumana ang app.</p>
 <H>Draw at regalo</H>
 <p>Random ang draw at hindi pwedeng i-undo. Hindi kami sangkot sa pagbili, pagpapadala, o pagbibigay ng regalo, at hindi kami responsable sa alitan ng mga miyembro ng group.</p>
 <H>Pagsuspinde</H>
 <p>Pwede naming i-suspend o burahin ang account o group na lumalabag sa terms na ito.</p>
 <H>Limitasyon ng pananagutan</H>
 <p>Sa abot ng pinapayagan ng batas, hindi kami mananagot sa anumang pinsala o pagkawala na dulot ng paggamit ng app.</p>
 <H>Mga pagbabago at contact</H>
 <p>Maaaring magbago ang terms na ito. Ang patuloy na paggamit ay pagsang-ayon sa bagong bersyon. May tanong? Mag-email sa <b>{CONTACT}</b>.</p>
 <p><a className="underline font-bold" href="#/privacy">Basahin ang Privacy Policy</a></p></Page>}
