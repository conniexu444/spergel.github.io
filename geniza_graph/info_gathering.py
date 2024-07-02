#Joshua Spergel
#Nov 14 2022
#Legal Documents Code


import csv
import re
#Gets all document types from the input file and outputs in output file
def get_document_type(input_file, output_file, file_type_requested):
    with open(input_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        with open(output_file, mode='w') as output:
            fieldnames = ["pgpid", "description"]
            writer =  csv.writer(output)
            writer.writerow(fieldnames)
            for row in reader:
                if(row['type']== file_type_requested):
                    r = [row['pgpid'],row['description']]
                    writer.writerow(r)
            output.close()


#
def normalize_name(test_name):
    Barukh = ["Barukh", "Baruk", "Baruch"]
    Efrayim = ["Efrayim","Ephraim","Ephrayim"]
    David = ["David", "Daud", "Dawud"]
    Hasan = ["Hasan", "Hasun", "Hassun"]
    Khalluf = ["Khalluf", "Khalfun","Khalaf","Khalfa","Khulayf"]
    Mevorakh = ["Mevorakh", "Mevorak"]
    Moshe = ["Moshe", "Musa"]
    Menasche = ["Menasche", "Manasche"]
    Natan = ["Natan", "Nathan", "Nahum"]
    Netanel = ["Netanel", "Nethanel", "Natanel", "Nathaniel"]
    Saadya = ["Saadya", "Saada", "Saadyah", "Seadya"]
    Sadaqa = ["Sadaqa", "Sedaqa", "Sadaqah", "Sadoq"]
    Shelomo = ["Shelomo", "Shemuel"]
    Shemarya = ["Shemarya", "Shemariah", "Shemaya"]
    Sughmar = ["Sughmar", "Sighmar"]
    Tovia = ["Tovia", "Toviya", "Toviyya", "Toviyyahu", "Tuviyyahu", "Tuvya"]
    Yaaqov = ["Yaaqov", "Jacob", "Yaqub", "Yaakov"]
    Yehoshua = ["Yehoshua", "Yeshua", "Yehoshuaha", "Yoshua"]
    Yishaq = ["Yishaq", "Yitzhak", "Ishaq", "Yizhak", "Isaac"]
    Yisrael = ["Yisrael", "Israel"]
    Yosef = ["Yosef", "Joseph", "Yusuf", "Yehosef"]
    
    all_names = [Barukh, Efrayim, David, Hasan, Khalluf, Mevorakh,
                 Moshe, Menasche, Natan, Netanel, Saadya,
                 Sadaqa, Shelomo, Shemarya, Sughmar, Tovia,
                 Yaaqov, Yehoshua, Yishaq, Yisrael, Yosef]
    for alt_name in all_names:
        if name in alt_name:
            replacement_name = alt_name[0]
            break
    return name, replacement_name

#Baruk,Baruch,Barukh
#Titles:
#Abu, Abi
#ha-Haver,he-Haver

#Locations:
#Furat, Fustat, al-Furat
#al-Itrabulusi, Atrabulusi
#Iskanderani,Iskandrani
#Maghribi,Magribi
#al-Tahirti, Tahirti,Taherti

#al-, l-
      
#gets names from document
def get_names_from_letters(input_file, output_file):
    with open(input_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        
        with open(output_file, mode='w') as csvfile2:
            fieldnames = ["pgpid", "first_person","second_person"]
            writer = csv.writer(csvfile2)
            writer.writerow(fieldnames)
            
            for row in reader:
                if "from" in row['description'] and "to" in row['description']:
                    description_split_on_from = row['description'].split("from")
                    
                    description_after_first_from = description_split_on_from[1]

                    #checking to see if there is a potential second from. See pgpid 571
                    if "to" in description_after_first_from:
                        description_split_on_to_after_from = description_after_first_from.split("to")
                    
                        first_person = description_split_on_to_after_from[0]
                        #removing punctuation after a name because it usually is after a name
                        if "," in first_person:
                            first_person_no_comma = first_person.split(",")
                            first_person = first_person_no_comma[0]
                        #replacing b. with ben so "." can be split on
                        if "b." in first_person:
                            first_person = first_person.replace("b.", "ben")

                        if "." in first_person:
                            first_person_no_period = first_person.split(".")
                            first_person = first_person_no_period[0]
                            
                        second_person = description_split_on_to_after_from[1]
                        if "," in second_person:
                            second_person_no_comma = second_person.split(",")
                            second_person = second_person_no_comma[0]
                        if "b." in second_person:
                            second_person = second_person.replace("b.", "ben")

                        if "." in second_person:
                            second_person_no_period = second_person.split(".")
                            second_person = second_person_no_period[0]
                                
                        r = [row['pgpid'], first_person,second_person]
                        writer.writerow(r)
        csvfile2.close()


#
def legal_documents(input_file, output_file):
    with open(input_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        with open(output_file, mode='w') as csvfile2:
            fieldnames = ["pgpid", "people","year","location", "author", "original_names"]
            writer = csv.writer(csvfile2)
            writer.writerow(fieldnames)
            for row in reader:
                description_lower = row['description'].lower()
                description_normalized = normalize(description_lower)
                description_normalized = re.sub(r'[^\w\s]','', description_lower)
                
                
                names, original_names = get_names(description_normalized)
                location = get_location(description_normalized)
                author = get_author(description_normalized)
                year = get_year(description_normalized)
                r = [row['pgpid'], names,year, author, original_names]
                writer.writerow(r)
            csvfile2.close()
        csvfile1.close()


def normalize(desc)
    desc_nop = desc.replace("'","") #gets rid of 's because they often mess up Yeshu'a and other names
    desc_al_replaced = desc.replace(" al-", " al ") #makes al into a middle name that can be easily used
    desc_al_replaced = desc.replace(" abu-", " abu ") #makes al into a middle name that can be easily used
def get_names(input_text):
    pre_names = ["r.", ]
    middle_names = ['b.', 'ibn', 'abu', 'al' ]
    end_names = ["ha-kohen", "gaon"]
    #sometimes it notes people as the son of the gaon which is bad
def get_year(input_text):
        list_text = input_text.split()
        for l in list_text:
            match = re.match(r'.*([1][0-9]{3})', l)
            if match is not None:
               return match.group(1)
        
#gets rid of things that are very clearly not names that would be helpful
def edit(input_file):
    with open(input_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        with open(output_file, mode='w') as csvfile2:
            fieldnames = ["pgpid", "first_person","second_person"]
            writer = csv.writer(csvfile2)
            writer.writerow(fieldnames)
            bad_words = ["?", "unidentified", "unknown", "community", "communities", "the parnas"]
            for row in reader:
                if any(x in row['first_person'] for x in bad_words) == False:
                    if any(x in row['second_person'] for x in bad_words) == False: 
                        r = [row['pgpid'], row['first_person'],row['second_person']]
                        writer.writerow(r)
#Takes the names of someone and finds everyone that they talked to talked to that is not them   
def find_all_with_name(input_file, output_file, name):
    with open(input_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        friends_of_person = []
        for row in reader:
            #row['first_person'].decode("utf-8")
            #row['second_person'].decode("utf-8")
            if name in row["first_person"]:
                if any(i in row['second_person'] for i in friends_of_person) == False:
                    friends_of_person.append(row['second_person'])
            if name in row["second_person"]:
                if any(i in row['first_person'] for i in friends_of_person) == False:
                    friends_of_person.append(row['first_person'])
        csvfile.close()
    with open(input_file, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        with open(output_file, mode='w') as csvfile2:
            writer = csv.writer(csvfile2)
            fieldnames = ["pgpid", "first_person","second_person"]
            for i in friends_of_person:
                for row in reader:
                    #row['first_person'].decode("utf-8")
                    #row['second_person'].decode("utf-8")
                    if i in row['first_person'] and name not in row['second_person']:
                        r = [row['pgpid'], row['first_person'],row['second_person']]
                        writer.writerow(r)
                    if i in row['second_person']and name not in row['first_person']:
                        r = [row['pgpid'], row['first_person'],row['second_person']]
                        writer.writerow(r)
                                    
        csvfile2.close()

#get_letters_from_main_info()
#get_names_from_letters()
i = "/Users/joshs/Desktop/pgp_docs.csv"
j = "/Users/joshs/Desktop/legal_docs.csv"
k = "Legal"


#get_document_type(i,j,k)
#find_all_with_name("Yoshiyya ha Gaon")
